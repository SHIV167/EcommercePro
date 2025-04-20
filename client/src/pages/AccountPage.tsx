import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from 'react-helmet';

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate("/login?redirect=/account");
    return null;
  }
  
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: [`/api/orders?userId=${user?.id}`],
    enabled: !!user?.id,
  });
  
  return (
    <>
      <Helmet>
        <title>My Account | Kama Ayurveda</title>
        <meta name="description" content="Manage your account and view your orders." />
      </Helmet>
      
      <div className="bg-neutral-cream py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl text-primary text-center">My Account</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full border-b border-neutral-sand bg-transparent justify-start mb-8 rounded-none">
            <TabsTrigger value="profile" className="font-heading text-primary data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-6">Profile</TabsTrigger>
            <TabsTrigger value="orders" className="font-heading text-primary data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-6">Orders</TabsTrigger>
            <TabsTrigger value="addresses" className="font-heading text-primary data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-6">Addresses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="border border-neutral-sand rounded-md overflow-hidden">
                  <div className="bg-neutral-cream p-4 border-b border-neutral-sand">
                    <h2 className="font-heading text-lg text-primary">Profile Information</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-gray mb-1">Name</label>
                        <p className="font-medium">{user?.name || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-gray mb-1">Email</label>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-gray mb-1">Phone</label>
                        <p className="font-medium">{user?.phone || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border border-neutral-sand rounded-md overflow-hidden">
                  <div className="bg-neutral-cream p-4 border-b border-neutral-sand">
                    <h2 className="font-heading text-lg text-primary">Change Password</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-neutral-gray mb-4">
                      Update your password to maintain the security of your account.
                    </p>
                    <Button 
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="border border-neutral-sand rounded-md overflow-hidden">
                  <div className="bg-neutral-cream p-4 border-b border-neutral-sand">
                    <h2 className="font-heading text-lg text-primary">Account Actions</h2>
                  </div>
                  <div className="p-6">
                    <Button 
                      onClick={logout}
                      variant="outline"
                      className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white mb-4"
                    >
                      Logout
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-full text-neutral-gray hover:text-red-500"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-0">
            <div className="border border-neutral-sand rounded-md overflow-hidden">
              <div className="bg-neutral-cream p-4 border-b border-neutral-sand">
                <h2 className="font-heading text-lg text-primary">Your Orders</h2>
              </div>
              <div className="p-6">
                {ordersLoading ? (
                  <div className="animate-pulse space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border border-neutral-sand rounded-md p-4">
                        <div className="h-6 w-32 bg-neutral-sand mb-4"></div>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="h-4 w-full bg-neutral-sand"></div>
                          <div className="h-4 w-full bg-neutral-sand"></div>
                          <div className="h-4 w-full bg-neutral-sand"></div>
                          <div className="h-4 w-full bg-neutral-sand"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="divide-y divide-neutral-sand">
                    {orders.map((order) => (
                      <div key={order.id} className="py-4">
                        <div className="flex flex-col md:flex-row justify-between mb-2">
                          <div>
                            <p className="font-heading text-primary">Order #{order.id}</p>
                            <p className="text-sm text-neutral-gray">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-neutral-100 text-neutral-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="mb-4">
                          <span className="font-medium">Total:</span> ₹{order.total.toFixed(2)}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary hover:text-white"
                          >
                            View Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-neutral-gray"
                          >
                            Track Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-gray mb-4">You haven't placed any orders yet.</p>
                    <Button 
                      asChild
                      className="bg-primary hover:bg-primary-light text-white"
                    >
                      <a href="/collections/all">Start Shopping</a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="addresses" className="mt-0">
            <div className="border border-neutral-sand rounded-md overflow-hidden">
              <div className="bg-neutral-cream p-4 border-b border-neutral-sand">
                <h2 className="font-heading text-lg text-primary">Saved Addresses</h2>
              </div>
              <div className="p-6">
                {user?.address ? (
                  <div className="border border-neutral-sand rounded-md p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <p className="font-medium">Default Address</p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 text-primary">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-red-500">
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p>{user.name}</p>
                    <p>{user.address}</p>
                    <p>{user.city}, {user.state} {user.zipCode}</p>
                    <p>{user.phone}</p>
                  </div>
                ) : (
                  <p className="text-neutral-gray mb-4">You don't have any saved addresses yet.</p>
                )}
                
                <Button 
                  className="bg-primary hover:bg-primary-light text-white"
                >
                  Add New Address
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
