import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";

export default function QRScannerManagement() {
  const { toast } = useToast();
  // Use client URL from env or fallback by stripping '-admin'
  const clientOrigin = import.meta.env.VITE_CLIENT_URL || window.location.origin.replace('-admin', '');
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

  // Scanner data
  const { data: scanners, refetch } = useQuery({
    queryKey: ["scanners"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/scanners");
      return res.json();
    },
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

  const handleGenerate = () => {
    if (!selectedProduct) return toast({ title: "Select a product", variant: "destructive" });
    const prod = products.find(p => p._id === selectedProduct);
    if (!prod) return toast({ title: "Invalid product", variant: "destructive" });
    const url = `${clientOrigin}/products/${prod.slug}`;
    setQrValue(url);
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

  // Form state for scanner
  const [scanData, setScanData] = useState<string>("");
  const [scanProductId, setScanProductId] = useState<string>("");

  const handleAddScanner = () => {
    if (!scanData) return toast({ title: "Enter scan data", variant: "destructive" });
    createScanner.mutate({ data: scanData, productId: scanProductId || undefined });
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
        </div>
        {qrValue && (
          <div className="mt-4">
            <QRCodeCanvas value={qrValue} />
            <div className="flex items-center space-x-2 mt-2">
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
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Data</th>
                <th className="border p-2">Product ID</th>
                <th className="border p-2">Scanned At</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scanners?.map((s: any) => (
                <tr key={s._id}>
                  <td className="border p-2">{s._id}</td>
                  <td className="border p-2">{s.data}</td>
                  <td className="border p-2">{s.productId || '-'}</td>
                  <td className="border p-2">{new Date(s.scannedAt).toLocaleString()}</td>
                  <td className="border p-2">
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
