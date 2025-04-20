import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";
import ProductsManagement from "./pages/ProductsManagement";
import OrdersManagement from "./pages/OrdersManagement";
import UsersManagement from "./pages/UsersManagement";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <AdminAuthProvider>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Switch>
            <Route path="/login">
              <AdminLogin />
            </Route>
            
            <Route path="*">
              <ProtectedRoute>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-6 overflow-auto">
                      <Switch>
                        <Route path="/" component={Dashboard} />
                        <Route path="/products" component={ProductsManagement} />
                        <Route path="/orders" component={OrdersManagement} />
                        <Route path="/users" component={UsersManagement} />
                        <Route>
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <h1 className="text-2xl font-heading text-primary mb-4">Page Not Found</h1>
                              <p className="text-neutral-gray">The page you are looking for does not exist.</p>
                            </div>
                          </div>
                        </Route>
                      </Switch>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            </Route>
          </Switch>
        </div>
        <Toaster />
      </TooltipProvider>
    </AdminAuthProvider>
  );
}

// ProtectedRoute component to check authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}

export default App;
