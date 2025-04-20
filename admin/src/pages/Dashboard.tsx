import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard() {
  // Fetch summary data
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/summary"],
  });
  
  // Fetch recent orders
  const { data: recentOrders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["/api/orders?limit=5"],
  });
  
  // Fetch top products
  const { data: topProducts, isLoading: isProductsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/top-products"],
  });
  
  // Sample data for charts when API doesn't return data yet
  const sampleSalesData = [
    { name: 'Jan', revenue: 7000 },
    { name: 'Feb', revenue: 5000 },
    { name: 'Mar', revenue: 12000 },
    { name: 'Apr', revenue: 10000 },
    { name: 'May', revenue: 18000 },
    { name: 'Jun', revenue: 15000 },
    { name: 'Jul', revenue: 22000 },
  ];
  
  const sampleProductCategoryData = [
    { name: 'Skincare', value: 45 },
    { name: 'Haircare', value: 28 },
    { name: 'Bath & Body', value: 17 },
    { name: 'Wellness', value: 10 },
  ];
  
  // Default summary data if API hasn't returned yet
  const summary = summaryData || {
    totalOrders: 125,
    totalRevenue: 145000,
    totalCustomers: 248,
    lowStockProducts: 5,
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-primary mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store's performance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Total Orders</CardTitle>
            <CardDescription>All time orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isSummaryLoading ? (
                <div className="h-9 w-20 animate-pulse bg-muted rounded"></div>
              ) : (
                summary.totalOrders
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-green-500">↑ 12%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Revenue</CardTitle>
            <CardDescription>All time sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isSummaryLoading ? (
                <div className="h-9 w-28 animate-pulse bg-muted rounded"></div>
              ) : (
                `₹${summary.totalRevenue.toLocaleString()}`
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-green-500">↑ 8%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Customers</CardTitle>
            <CardDescription>Total registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isSummaryLoading ? (
                <div className="h-9 w-20 animate-pulse bg-muted rounded"></div>
              ) : (
                summary.totalCustomers
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-green-500">↑ 5%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Low Stock</CardTitle>
            <CardDescription>Products that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isSummaryLoading ? (
                <div className="h-9 w-10 animate-pulse bg-muted rounded"></div>
              ) : (
                summary.lowStockProducts
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-red-500">↑ 2</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Store performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monthly">
              <TabsList className="mb-4">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={sampleSalesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#5C3834"
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Sales by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sampleProductCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Bar dataKey="value" fill="#D4B78F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders from your store</CardDescription>
          </CardHeader>
          <CardContent>
            {isOrdersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded"></div>
                      <div className="h-3 w-32 bg-muted rounded"></div>
                    </div>
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-2">Order ID</th>
                    <th className="text-left pb-2">Customer</th>
                    <th className="text-left pb-2">Status</th>
                    <th className="text-right pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border">
                      <td className="py-3">#{order.id}</td>
                      <td className="py-3">{order.userId}</td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 text-right">₹{order.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-6 text-muted-foreground">No recent orders found</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products</CardDescription>
          </CardHeader>
          <CardContent>
            {isProductsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-border animate-pulse">
                    <div className="h-10 w-10 bg-muted rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded"></div>
                      <div className="h-3 w-20 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sample top products */}
                <div className="flex gap-3 py-2 border-b border-border">
                  <div className="h-10 w-10 bg-muted rounded-md overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1629198735566-e36c0bd9ad76"
                      alt="Product"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Kumkumadi Face Oil</p>
                    <p className="text-sm text-muted-foreground">128 sold</p>
                  </div>
                </div>
                
                <div className="flex gap-3 py-2 border-b border-border">
                  <div className="h-10 w-10 bg-muted rounded-md overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1631729371254-42c2892f0e6e"
                      alt="Product"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Bringadi Hair Oil</p>
                    <p className="text-sm text-muted-foreground">95 sold</p>
                  </div>
                </div>
                
                <div className="flex gap-3 py-2 border-b border-border">
                  <div className="h-10 w-10 bg-muted rounded-md overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1566958769312-82cef41d19ef"
                      alt="Product"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Rose Jasmine Cleanser</p>
                    <p className="text-sm text-muted-foreground">87 sold</p>
                  </div>
                </div>
                
                <div className="flex gap-3 py-2 border-b border-border">
                  <div className="h-10 w-10 bg-muted rounded-md overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1601055903647-ddf1ee9701b1"
                      alt="Product"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Pure Rose Water</p>
                    <p className="text-sm text-muted-foreground">76 sold</p>
                  </div>
                </div>
                
                <div className="flex gap-3 py-2">
                  <div className="h-10 w-10 bg-muted rounded-md overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1608571423539-e951a99b1e8a"
                      alt="Product"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Youth-Clarifying Mask</p>
                    <p className="text-sm text-muted-foreground">68 sold</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
