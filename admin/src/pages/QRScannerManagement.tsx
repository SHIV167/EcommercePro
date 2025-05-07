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
      // Do not clear the row email input after successful submission
    } catch (error) {
      console.error(error);
      toast({ title: "Email send failed", variant: "destructive" });
    }
  };

  const handleCouponCodeChange = (scannerId: string, newCouponCode: string) => {
    updateCouponCode.mutate({ scannerId, couponCode: newCouponCode });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">QR Scanner Management</h1>

      {/* QR Generator */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Generate QR Code</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="productSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Select Product
            </label>
            <select
              id="productSelect"
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select Product --</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="emailAddr" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="emailAddr"
              type="email"
              value={emailAddr}
              onChange={e => setEmailAddr(e.target.value)}
              placeholder="Enter email to share"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-4">
          <button
            onClick={handleGenerate}
            disabled={!selectedProduct}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Generate QR
          </button>
          <button
            onClick={handleShare}
            disabled={!qrValue}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Copy URL
          </button>
          <button
            onClick={handleEmailShare}
            disabled={!qrValue || !emailAddr}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Share via Email
          </button>
        </div>
        <div className="mt-6 flex justify-center">
          <canvas ref={qrRef} className="border rounded-lg shadow-lg" />
        </div>
      </div>

      {/* QR List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generated QR Codes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon Code</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scanners?.map(s => (
                <tr key={s._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s._id?.slice(-6)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {products.find(p => p._id === s.productId)?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => deleteScanner.mutate(s._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={rowEmails[s._id] || ""}
                        onChange={e => setRowEmails(prev => ({ ...prev, [s._id]: e.target.value }))}
                        placeholder="Email"
                        className="p-1 border rounded w-32"
                      />
                      <button
                        onClick={() => handleRowEmailShare(s._id, s.data, products.find(p => p._id === s.productId)?.name)}
                        className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                      >
                        Send
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <input
                      type="text"
                      value={s.couponCode || ""}
                      onChange={e => handleCouponCodeChange(s._id, e.target.value)}
                      placeholder="Coupon Code"
                      className="p-1 border rounded w-24"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-2">
            <input
              type="text"
              value={scanData}
              onChange={e => setScanData(e.target.value)}
              placeholder="Scanned data"
              className="p-1 border rounded w-32"
            />
            <input
              type="text"
              value={scanProductId}
              onChange={e => setScanProductId(e.target.value)}
              placeholder="Product ID (optional)"
              className="p-1 border rounded w-32"
            />
            <button
              onClick={handleAddScanner}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Add Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
