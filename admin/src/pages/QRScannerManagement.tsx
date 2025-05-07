import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";

export default function QRScannerManagement() {
  const { toast } = useToast();
  const qrRef = useRef<HTMLCanvasElement>(null);
  // Use client URL from env or fallback by stripping '-admin'
  const clientOrigin = import.meta.env.VITE_CLIENT_URL || (window.location.origin.includes('-admin')
    ? window.location.origin.replace('-admin', '-0ukc')
    : window.location.origin);
  // Products for QR generation
  const { data: prodData } = useQuery({
    queryKey: ["products_all"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/products?page=1&limit=1000");
      return (await res.json()).products as Product[];
    },
  });
  const products = prodData || [];

  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [qrValue, setQrValue] = useState<string>("");
  const [emailAddr, setEmailAddr] = useState<string>("");

  // Fetch available coupons for QR codes
  const { data: couponsData } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/coupons");
      return await res.json();
    },
  });
  const coupons = couponsData || [];

  // Function to create a QR-specific coupon if none exist
  const createQrCoupon = useMutation({
    mutationFn: async () => {
      const couponData = {
        code: `QR-SCAN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        description: "Auto-generated QR Scan Discount",
        discountType: "percentage",
        discountAmount: 10, // 10% discount
        minimumOrderValue: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        usageLimit: 1000,
        usageLimitPerUser: 1,
        isActive: true,
      };
      const res = await apiRequest("POST", "/api/admin/coupons", couponData);
      return res.json();
    },
    onSuccess: (newCoupon) => {
      toast({ title: "QR Coupon Created", description: `Coupon ${newCoupon.code} created for QR scans.` });
    },
    onError: (error) => {
      console.error("Failed to create QR coupon", error);
      toast({ title: "Failed to create QR coupon", variant: "destructive" });
    },
  });

  // Scanner data
  const { data: scanners, refetch } = useQuery({
    queryKey: ["scanners"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/scanners");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const createScanner = useMutation({
    mutationFn: async (body: any) => {
      const res = await apiRequest("POST", "/api/scanners", body);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Scanner entry created" });
      refetch();
    },
  });

  const deleteScanner = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/scanners/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Scanner entry deleted" });
      refetch();
    },
  });

  const updateCouponCode = useMutation({
    mutationFn: async ({ scannerId, couponCode }: { scannerId: string; couponCode: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/qr-scanner/${scannerId}`, { couponCode });
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({ title: "Coupon Code Updated", description: `Coupon code updated for scanner ${variables.scannerId}.` });
      refetch(); // Refresh the scanner list
    },
    onError: (error) => {
      console.error("Failed to update coupon code", error);
      toast({ title: "Failed to update coupon code", variant: "destructive" });
    },
  });

  const handleGenerate = () => {
    if (!selectedProduct) return toast({ title: "Select a product", variant: "destructive" });
    const prod = products.find(p => p._id === selectedProduct);
    if (!prod) return toast({ title: "Invalid product", variant: "destructive" });
    const url = `${clientOrigin}/products/${prod.slug}`;
    setQrValue(url);
    createScanner.mutate({ data: url, productId: selectedProduct, scannedAt: new Date().toISOString() });
  };

  const handleGenerateAll = () => {
    products.forEach((prod) => {
      const urlAll = `${clientOrigin}/products/${prod.slug}`;
      createScanner.mutate({ data: urlAll, productId: prod._id, scannedAt: new Date().toISOString() });
    });
    toast({ title: "All QR codes generated" });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(qrValue);
    toast({ title: "URL copied" });
  };

  const handleEmailShare = async () => {
    if (!emailAddr) return toast({ title: "Enter email", variant: "destructive" });
    try {
      const prod = products.find(p => p._id === selectedProduct);
      await apiRequest("POST", "/api/scanners/share", { email: emailAddr, url: qrValue, productName: prod?.name });
      toast({ title: "QR sent via email" });
    } catch (error) {
      console.error(error);
      toast({ title: "Email send failed", variant: "destructive" });
    }
  };

  const handleDownload = () => {
    if (qrRef.current) {
      const dataUrl = qrRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${selectedProduct || "qr"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Form state for scanner
  const [scanData, setScanData] = useState<string>("");
  const [scanProductId, setScanProductId] = useState<string>("");

  // State for per-row email inputs
  const [rowEmails, setRowEmails] = useState<Record<string, string>>({});

  const handleAddScanner = () => {
    if (!scanData) return toast({ title: "Enter scan data", variant: "destructive" });
    createScanner.mutate({ data: scanData, productId: scanProductId || undefined, scannedAt: new Date().toISOString() });
  };

  // Handle email share for each row
  const handleRowEmailChange = (id: string, value: string) => {
    setRowEmails(prev => ({ ...prev, [id]: value }));
  };

  const handleRowEmailShare = async (id: string, url: string, productName?: string) => {
    const email = rowEmails[id];
    if (!email) return toast({ title: "Enter email", variant: "destructive" });
    try {
      await apiRequest("POST", "/api/scanners/share", { email, url, productName });
      toast({ title: "QR sent via email" });
      setRowEmails(prev => ({ ...prev, [id]: "" }));
    } catch (error) {
      console.error(error);
      toast({ title: "Email send failed", variant: "destructive" });
    }
  };

  const handleCouponCodeChange = (scannerId: string, newCouponCode: string) => {
    updateCouponCode.mutate({ scannerId, couponCode: newCouponCode });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-heading">QR Scanner Management</h1>
      <section className="border p-4 rounded">
        <h2 className="text-lg mb-2">Generate QR Code</h2>
        <div className="flex items-center space-x-2">
          <select
            className="border p-2 rounded"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          <Button onClick={handleGenerate}>Generate</Button>
          <Button onClick={handleGenerateAll}>Generate All</Button>
        </div>
        {qrValue && (
          <div className="mt-4">
            <QRCodeCanvas value={qrValue} ref={qrRef} />
            <div className="flex items-center space-x-2 mt-2">
              <Button onClick={handleDownload}>Download</Button>
              <Button onClick={handleShare}>Copy URL</Button>
              <Input type="email" placeholder="Email address" value={emailAddr} onChange={e => setEmailAddr(e.target.value)} />
              <Button onClick={handleEmailShare}>Email QR</Button>
            </div>
          </div>
        )}
      </section>

      <section className="border p-4 rounded">
        <h2 className="text-lg mb-2">Scanned Entries</h2>
        <div className="overflow-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr>
                <th className="border border-gray-400 p-1">ID</th>
                <th className="border border-gray-400 p-1">Data</th>
                <th className="border border-gray-400 p-1">Product ID</th>
                <th className="border border-gray-400 p-1">Scanned At</th>
                <th className="border border-gray-400 p-1">QR Code</th>
                <th className="border border-gray-400 p-1">Email</th>
                <th className="border border-gray-400 p-1">Coupon Code</th>
                <th className="border border-gray-400 p-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scanners?.map((s: any) => (
                <tr key={s._id}>
                  <td className="border border-gray-400 p-1">{s._id}</td>
                  <td className="border border-gray-400 p-1">{s.data}</td>
                  <td className="border border-gray-400 p-1">{s.productId || '-'}</td>
                  <td className="border border-gray-400 p-1">{new Date(s.scannedAt).toLocaleString()}</td>
                  <td className="border border-gray-400 p-1">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(s.data)}&size=100x100`} alt="QR Code" />
                  </td>
                  <td className="border border-gray-400 p-1">
                    <div className="flex items-center space-x-2">
                      <Input type="email" placeholder="Email" value={rowEmails[s._id] || ""} onChange={e => handleRowEmailChange(s._id, e.target.value)} />
                      <Button size="sm" onClick={() => handleRowEmailShare(s._id, s.data, products.find(p => p._id === s.productId)?.name)}>Send</Button>
                    </div>
                  </td>
                  <td className="border border-gray-400 p-1">
                    <Input 
                      value={s.couponCode || ""} 
                      onChange={(e) => handleCouponCodeChange(s._id, e.target.value)} 
                      placeholder="Enter Coupon Code"
                      className="w-full"
                    />
                  </td>
                  <td className="border border-gray-400 p-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteScanner.mutate(s._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center space-x-2">
          <Input
            placeholder="Scanned data"
            value={scanData}
            onChange={(e) => setScanData(e.target.value)}
          />
          <Input
            placeholder="Product ID (optional)"
            value={scanProductId}
            onChange={(e) => setScanProductId(e.target.value)}
          />
          <Button onClick={handleAddScanner}>Add Entry</Button>
        </div>
      </section>
    </div>
  );
}
