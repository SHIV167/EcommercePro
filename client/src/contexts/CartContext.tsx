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
  addItem: (product: Product) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  isEmpty: boolean;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  subtotal: 0,
  totalItems: 0,
  isEmpty: true,
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate derived values
  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
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

  // Add item to cart
  const addItem = async (product: Product) => {
    try {
      // If we don't have a cartId yet, we can't add items
      if (!cartId && isInitialized) {
        // Create a cart first
        const sessionId = localStorage.getItem("cartSessionId");
        const response = await apiRequest("POST", "/api/cart", { sessionId });
        const data = await response.json();
        setCartId(data.id);
      }

      // Find if the item already exists in the cart
      const existingItemIndex = cartItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const updatedItems = [...cartItems];
        updatedItems[existingItemIndex].quantity += 1;
        setCartItems(updatedItems);

        // Update the item in the API
        if (cartId) {
          await apiRequest("PUT", `/api/cart/items/${updatedItems[existingItemIndex].id}`, {
            quantity: updatedItems[existingItemIndex].quantity,
          });
        }
      } else {
        // Item doesn't exist, add it
        const newItem: CartItem = {
          id: Date.now(), // Temporary ID until we get response from API
          product,
          quantity: 1,
        };

        setCartItems([...cartItems, newItem]);

        // Add the item to the API
        if (cartId) {
          const response = await apiRequest("POST", "/api/cart/items", {
            cartId,
            productId: product.id,
            quantity: 1,
          });
          
          const data = await response.json();
          
          // Update the item with the correct ID from the API
          setCartItems((prev) =>
            prev.map((item) =>
              item.id === newItem.id ? { ...item, id: data.id } : item
            )
          );
        }
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: number) => {
    try {
      setCartItems(cartItems.filter((item) => item.id !== itemId));

      // Remove from API
      if (cartId) {
        await apiRequest("DELETE", `/api/cart/items/${itemId}`, null);
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      if (quantity <= 0) {
        removeItem(itemId);
        return;
      }

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
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setCartItems([]);

      // Clear in API
      if (cartId) {
        await apiRequest("DELETE", `/api/cart/${cartId}`, null);
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
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
