import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useCoupon } from "@/hooks/useCoupon";
import { CouponForm } from "@/components/coupon/CouponForm";
import { formatCurrency } from "@/lib/utils";
import { Helmet } from 'react-helmet';
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const { cartItems, removeItem, updateQuantity, subtotal, isEmpty, totalItems } = useCart();
  const { appliedCoupon, applyCoupon, removeCoupon, calculateDiscountedTotal } = useCoupon();
  const { toast } = useToast();
  
  const finalTotal = calculateDiscountedTotal(subtotal);
  
  const handleRemove = async (itemId: number) => {
    try {
      await removeItem(itemId);
      toast({ title: "Removed from cart", description: "Item removed successfully." });
    } catch {
      toast({ title: "Remove failed", description: "Could not remove item. Please try again.", variant: "destructive" });
    }
  };
  const handleUpdateQuantity = async (itemId: number, qty: number) => {
    try {
      await updateQuantity(itemId, qty);
      toast({ title: "Cart updated", description: `Quantity updated to ${qty}.` });
    } catch {
      toast({ title: "Update failed", description: "Could not update quantity. Please try again.", variant: "destructive" });
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Your Cart | Kama Ayurveda</title>
        <meta name="description" content="Review the items in your shopping cart and proceed to checkout." />
      </Helmet>
      
      <div className="bg-neutral-cream py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl text-primary text-center">Your Cart</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {isEmpty ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted-foreground mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="font-heading text-2xl text-primary mb-4">Your cart is empty</h2>
            <p className="text-neutral-gray mb-8">Looks like you haven't added any products to your cart yet.</p>
            <Button 
              asChild
              className="bg-primary hover:bg-primary-light text-white"
            >
              <Link href="/collections/all">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="border border-neutral-sand rounded-md overflow-hidden">
                <div className="bg-neutral-cream p-4 border-b border-neutral-sand">
                  <h2 className="font-heading text-lg text-primary">
                    Cart Items ({totalItems})
                  </h2>
                </div>
                
                <div className="divide-y divide-neutral-sand">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-24 h-24 bg-neutral-sand rounded-md overflow-hidden">
                          {item.product && item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <Link 
                              href={`/products/${item.product?.slug ?? ""}`}
                              className="font-heading text-primary hover:text-primary-light line-clamp-2"
                            >
                              {item.product?.name ?? "Unknown Product"}
                            </Link>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="text-muted-foreground hover:text-foreground"
                              aria-label="Remove item"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          {item.product?.shortDescription && (
                            <p className="text-sm text-neutral-gray mt-1">
                              {item.product.shortDescription}
                            </p>
                          )}
                          <div className="flex justify-between items-end mt-4">
                            {item.product?.slug ? (
                              <div className="flex items-center border border-neutral-sand rounded-md">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center text-foreground"
                                  disabled={item.quantity <= 1}
                                  aria-label="Decrease quantity"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-foreground"
                                  aria-label="Increase quantity"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <span className="font-medium">Qty: {item.quantity}</span>
                            )}
                            <div className="text-right">
                              <p className="font-medium text-primary">
                                {formatCurrency((item.product?.price ?? 0) * item.quantity)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(item.product?.price ?? 0)} each
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between">
                <Button 
                  asChild
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Link href="/collections/all">Continue Shopping</Link>
                </Button>
              </div>
            </div>
            
            <div>
              <div className="border border-neutral-sand rounded-md overflow-hidden sticky top-4">
                <div className="bg-neutral-cream p-4 border-b border-neutral-sand">
                  <h2 className="font-heading text-lg text-primary">Order Summary</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-gray">Subtotal</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    
                    {/* Coupon Form */}
                    <CouponForm
                      cartTotal={subtotal}
                      onCouponApplied={applyCoupon}
                      onCouponRemoved={removeCoupon}
                      appliedCoupon={appliedCoupon}
                    />
                    
                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(appliedCoupon.discountValue)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-gray">Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-gray">Tax</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="border-t border-neutral-sand pt-4 flex justify-between items-center">
                      <span className="font-heading text-primary">Total</span>
                      <span className="font-heading text-xl text-primary">{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      asChild
                      className="w-full bg-primary hover:bg-primary-light text-white uppercase tracking-wider py-6 font-medium"
                    >
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                  </div>
                  
                  <div className="mt-4 text-xs text-neutral-gray">
                    <p className="mb-2">
                      Get complimentary products worth ₹3990 on orders above ₹4000
                    </p>
                    <p>
                      Free shipping on orders above ₹500
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
