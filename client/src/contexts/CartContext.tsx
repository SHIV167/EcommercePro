import { createContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  totalItems: number;
  isEmpty: boolean;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addItem: async () => {},
  removeItem: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  subtotal: 0,
  totalItems: 0,
  isEmpty: true,
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate derived values
  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      (item.product && typeof item.product.price === 'number'
        ? item.product.price * item.quantity
        : 0),
    0
  );
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isEmpty = cartItems.length === 0;

  // Initialize cart on component mount
  useEffect(() => {
    const initializeCart = async () => {
      try {
        // Generate a unique session ID if we don't have one
        let sessionId = localStorage.getItem("cartSessionId");
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          localStorage.setItem("cartSessionId", sessionId);
        }

        // Fetch cart from API
        const response = await fetch(`/api/cart?sessionId=${sessionId}`, {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setCartId(data.id);
          
          if (data.items && Array.isArray(data.items)) {
            setCartItems(data.items);
          }
        }
      } catch (error) {
        console.error("Failed to initialize cart:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, []);

  // Add item to cart with optimistic updates
  const addItem = async (product: Product) => {
    const previousItems = [...cartItems];
    try {
      // Ensure cartId is available before proceeding
      let currentCartId = cartId;
      if (!currentCartId) {
        const sessionId = localStorage.getItem("cartSessionId");
        const cartResponse = await apiRequest("GET", `/api/cart?sessionId=${sessionId}`);
        const cartData = await cartResponse.json();
        setCartId(cartData.id);
        currentCartId = cartData.id;
      }
      if (!currentCartId) throw new Error("Cart ID not initialized");

      // Find if the item already exists
      const existingItemIndex = cartItems.findIndex(
        (item) => {
          const itemId = (item.product as any).id ?? (item.product as any)._id;
          const prodId = (product as any).id ?? (product as any)._id;
          return itemId === prodId;
        }
      );

      if (existingItemIndex !== -1) {
        // Optimistically update existing item
        const updatedItems = [...cartItems];
        updatedItems[existingItemIndex].quantity += 1;
        setCartItems(updatedItems);

        // Update in API
        await apiRequest("PUT", `/api/cart/items/${cartItems[existingItemIndex].id}`, {
          quantity: updatedItems[existingItemIndex].quantity,
        });
      } else {
        // Create a temporary item for new addition
        const tempItem: CartItem = {
          id: Date.now(),
          product,
          quantity: 1,
        };
        setCartItems([...cartItems, tempItem]);

        // Add to API
        const prodId = (product as any).id ?? (product as any)._id;
        const response = await apiRequest("POST", "/api/cart/items", {
          cartId: currentCartId,
          productId: prodId,
          quantity: 1,
        });
        // Defensive: handle empty or invalid JSON
        let data: any = {};
        try {
          const text = await response.text();
          data = text ? JSON.parse(text) : {};
        } catch (err) {
          data = {};
        }
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === tempItem.id ? { ...item, id: (data as any)?.id ?? item.id } : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      setCartItems(previousItems);
      throw error;
    }
  };

  // Remove item from cart with optimistic updates
  const removeItem = async (itemId: number) => {
    // Store previous state for rollback
    const previousItems = [...cartItems];
    
    try {
      // Optimistically remove item
      setCartItems(cartItems.filter((item) => item.id !== itemId));

      // Remove from API
      if (cartId) {
        await apiRequest("DELETE", `/api/cart/items/${itemId}`, null);
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      // Rollback on error
      setCartItems(previousItems);
    }
  };

  // Update item quantity with optimistic updates
  const updateQuantity = async (itemId: number, quantity: number) => {
    // Store previous state for rollback
    const previousItems = [...cartItems];

    try {
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }

      // Optimistically update quantity
      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );

      // Update in API
      if (cartId) {
        await apiRequest("PUT", `/api/cart/items/${itemId}`, { quantity });
      }
    } catch (error) {
      console.error("Failed to update cart item quantity:", error);
      // Rollback on error
      setCartItems(previousItems);
    }
  };

  // Clear cart with optimistic updates
  const clearCart = async () => {
    // Store previous state for rollback
    const previousItems = [...cartItems];

    try {
      // Optimistically clear cart
      setCartItems([]);

      // Clear in API
      if (cartId) {
        await apiRequest("DELETE", `/api/cart/${cartId}`, null);
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
      // Rollback on error
      setCartItems(previousItems);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        isEmpty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
