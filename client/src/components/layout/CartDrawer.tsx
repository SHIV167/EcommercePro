import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useCart } from "@/hooks/useCart";
import { Product } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, subtotal, removeItem, updateQuantity, isEmpty } = useCart();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 h-[100svh] top-0 right-0 translate-x-0 border-l rounded-none" side="right">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <p className="font-medium">Your Cart ({cartItems.length})</p>
          <button 
            className="text-foreground" 
            onClick={onClose}
            aria-label="Close cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col h-[calc(100%-160px)] overflow-auto">
          {isEmpty ? (
            <div className="text-center py-12 h-full flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button 
                variant="outline" 
                className="mt-4 border-primary text-primary hover:bg-primary hover:text-white uppercase tracking-wider py-2 px-6 font-medium text-sm transition-colors duration-300"
                onClick={onClose}
                asChild
              >
                <Link href="/collections/all">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-md overflow-hidden">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <Link 
                          href={`/products/${item.product.slug}`}
                          className="font-heading text-sm text-primary hover:text-primary-light line-clamp-2"
                          onClick={onClose}
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-auto">
                        {formatCurrency(item.product.price)}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-foreground"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-foreground"
                            aria-label="Increase quantity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <p className="font-medium text-foreground">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-border mt-auto p-4 space-y-4">
          <div className="flex justify-between items-center font-medium">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Shipping, taxes, and discounts calculated at checkout
          </p>
          <Separator />
          <Button
            className="w-full bg-primary hover:bg-primary-light text-white uppercase tracking-wider py-6 font-medium"
            disabled={isEmpty}
            onClick={onClose}
            asChild
          >
            <Link href="/checkout">Checkout</Link>
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-primary text-primary hover:bg-primary hover:text-white uppercase tracking-wider py-2 font-medium text-sm"
            onClick={onClose}
            asChild
          >
            <Link href="/collections/all">Continue Shopping</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
