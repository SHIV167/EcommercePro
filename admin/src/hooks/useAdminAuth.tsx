import React, { createContext, ReactNode, useEffect, useState, useContext } from "react";
import { useLocation } from "wouter";
import { apiRequest, API_BASE_URL } from "@/lib/queryClient";
import { User } from "@shared/schema";

interface AdminAuthContextType {
  admin: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {
    throw new Error("AdminAuthContext not initialized");
  },
  logout: async () => {
    throw new Error("AdminAuthContext not initialized");
  },
});

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAdmin = localStorage.getItem("admin");
        if (storedAdmin) {
          const adminData = JSON.parse(storedAdmin);
          setAdmin(adminData);
        } else {
          // Skip server auth check; rely on stored admin in localStorage
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      // Use apiRequest to ensure proxy and JSON handling
      const response = await apiRequest("POST", `${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      const userData = await response.json();
      console.log('Login successful, user data:', userData);
      
      if (!userData.isAdmin) {
        throw new Error("Not authorized as admin");
      }
      
      localStorage.setItem("admin", JSON.stringify(userData));
      setAdmin(userData);
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      localStorage.removeItem("admin");
      setAdmin(null);
      navigate("/admin/login");
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, isAuthenticated: !!admin && admin.isAdmin, isLoading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return context;
};
