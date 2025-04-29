import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

export default function TrackOrderPage() {
  const params = useParams();
  const { orderId } = params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      const res = await apiRequest("GET", `/api/orders/${orderId}`);
      setOrder(await res.json());
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="container mx-auto p-8">Loading...</div>;
  if (!order) return <div className="container mx-auto p-8">Order not found.</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-heading mb-4">Track Order</h1>
      <p><b>Order ID:</b> {order.id}</p>
      <p><b>Status:</b> {order.status}</p>
      {/* Add more tracking info here */}
      <Button asChild className="mt-4">
        <a href="/account">Back to Account</a>
      </Button>
    </div>
  );
}
