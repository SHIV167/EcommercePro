import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, Review } from "@shared/schema";
// Extend Review type with server-enriched fields
type EnrichedReview = Review & { _id?: string; userName?: string };
import ReviewForm from "@/components/product/ReviewForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TabsContentProps } from "@radix-ui/react-tabs";
import { Button } from "@/components/ui/button";
import RatingStars from "@/components/products/RatingStars";
import ProductCollection from "@/components/home/ProductCollection";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from 'react-helmet';
import { useEffect } from "react";
import StickyAddToCart from "@/components/products/StickyAddToCart";
import { apiRequest } from "@/lib/queryClient";
import SocialShare from "@/components/products/SocialShare";

export default function ProductPage() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [scannerEntry, setScannerEntry] = useState<any | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [pincode, setPincode] = useState('');
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [serviceData, setServiceData] = useState<any[] | null>(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  
  const { data: product, isLoading: productLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${slug}`],
    enabled: !!slug,
  });
  
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<EnrichedReview[]>({
    queryKey: [`/api/products/${product?._id}/reviews`],
    enabled: !!product?._id,
  });
  
  useEffect(() => {
    async function fetchPromoTimers() {
      const res = await fetch("/api/promotimers");
      const timers = await res.json();
      (window as any).PROMO_TIMERS = timers;
    }
    fetchPromoTimers();
  }, []);
  
  // Log QR scan event and apply coupon if available
  useEffect(() => {
    if (product?._id) {
      apiRequest("POST", "/api/scanners", { data: window.location.href, productId: product._id, scannedAt: new Date().toISOString() })
        .then(res => res.json())
        .then(entry => {
          setScannerEntry(entry);
          if (entry?.couponCode && !couponApplied) {
            // Here we would apply the coupon to the cart or store it for checkout
            (toast as any)("Coupon Applied");
            setCouponApplied(true);
            // Note: Actual coupon application logic would depend on backend API for cart or checkout
          }
        })
        .catch(err => console.error("Log scan error", err));
    }
  }, [product?._id, toast, couponApplied]);
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product!);
    }
    
    (toast as any)(`Added to cart`);
  };

  // Auto-advance slides on mobile only
  useEffect(() => {
    if (product?.images && product.images.length > 1) {
      const isMobile = window.innerWidth < 768; // 768px is the md breakpoint in Tailwind
      
      if (isMobile) {
        const timer = setInterval(() => {
          setSelectedImageIndex(prev => (prev + 1) % product.images.length);
        }, 3000);
        
        return () => clearInterval(timer);
      }
    }
  }, [product?.images]);
  
  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!product?.images) return;
    
    const difference = touchStartX - touchEndX;
    
    // Minimum swipe distance
    if (Math.abs(difference) > 50) {
      if (difference > 0) {
        // Swipe left - next image
        setSelectedImageIndex(prev => (prev + 1) % product.images.length);
      } else {
        // Swipe right - previous image
        setSelectedImageIndex(prev => (prev - 1 + product.images.length) % product.images.length);
      }
    }
    
    // Reset touch positions
    setTouchStartX(0);
    setTouchEndX(0);
  };

  const handleBuyNow = async (product: Product) => {
    try {
      for (let i = 0; i < quantity; i++) {
        await addItem(product);
      }
      (toast as any)('Added to cart');
      navigate('/checkout');
    } catch (error) {
      console.error('Error in Buy Now:', error);
      (toast as any)('Failed to process your request');
    }
  };

  const handleCheckPincode = () => {
    setServiceLoading(true);
    setServiceError('');
    setServiceData(null);

    if (!pincode) {
      setServiceError('Please enter a pincode');
      setServiceLoading(false);
      return;
    }

    if (pincode.length !== 6 || !/^[0-9]{6}$/.test(pincode)) {
      setServiceError('Please enter a valid 6-digit pincode');
      setServiceLoading(false);
      return;
    }

    // Check against valid pincodes from settings
    import("../lib/settings").then(({ VALID_PINCODES, DELIVERY_ESTIMATION_DAYS }) => {
      if (VALID_PINCODES.includes(pincode)) {
        // Calculate estimated delivery date
        const now = new Date();
        let deliveryDays = DELIVERY_ESTIMATION_DAYS.STANDARD_DAYS;
        
        // First digit of pincode determines if it's eligible for faster delivery
        if (pincode.startsWith('4')) {
          deliveryDays = DELIVERY_ESTIMATION_DAYS.FAST_DAYS;
        }
        
        const estimatedDate = new Date(now);
        estimatedDate.setDate(now.getDate() + deliveryDays);
        
        setServiceData([{
          rate: 0,
          estimated_delivery_date: estimatedDate.toISOString(),
        }]);
      } else {
        setServiceError('Sorry, delivery is not available to this pincode');
      }
      setServiceLoading(false);
    });
  };

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 bg-neutral-sand animate-pulse h-[500px]"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 w-3/4 bg-neutral-sand animate-pulse"></div>
            <div className="h-4 w-1/4 bg-neutral-sand animate-pulse"></div>
            <div className="h-24 w-full bg-neutral-sand animate-pulse"></div>
            <div className="h-8 w-1/3 bg-neutral-sand animate-pulse"></div>
            <div className="h-12 w-full bg-neutral-sand animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-heading text-primary mb-4">Product Not Found</h1>
        <p className="text-neutral-gray mb-8">Sorry, the product you're looking for could not be found.</p>
        <Button 
          onClick={() => navigate('/collections/all')}
          className="bg-primary hover:bg-primary-light text-white"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{product!.name} | Shiv Kumar jha</title>
        <meta name="description" content={product!.shortDescription || product!.description.substring(0, 160)} />
        <meta property="og:title" content={product!.name} />
        <meta property="og:description" content={product!.shortDescription || product!.description.substring(0, 160)} />
        <meta property="og:image" content={product!.images?.[selectedImageIndex] || product!.imageUrl} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
      </Helmet>
      {scannerEntry?.couponCode && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-yellow-100 p-4 rounded-md mb-4">
            <p className="text-xl font-semibold">Special Offer!</p>
            <p>Use code <span className="font-bold">{scannerEntry.couponCode}</span> at checkout for extra savings.</p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Image */}
          <div className="w-full md:w-1/2">
            <div className="border border-neutral-sand p-2 sm:p-4 md:p-8 rounded-md overflow-hidden">
              <div className="relative w-full aspect-square max-h-[70vh] flex flex-col">
                {/* Mobile Slider */}
                <div 
                  className="md:hidden relative w-full h-full"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div 
                    className="flex transition-transform duration-300 ease-in-out w-full h-full"
                    style={{
                      transform: `translateX(-${selectedImageIndex * 100}%`,
                      display: 'grid',
                      gridTemplateColumns: `repeat(${product!.images?.length || 1}, 100%)`
                    }}
                  >
                    {product!.images?.map((img, idx) => (
                      <div key={idx} className="w-full h-full flex items-center justify-center flex-shrink-0">
                        <img
                          src={img}
                          alt={`${product!.name} ${idx + 1}`}
                          className="max-w-full max-h-full w-auto h-auto object-contain"
                        />
                      </div>
                    )) || (
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={product!.imageUrl}
                          alt={product!.name}
                          className="max-w-full max-h-full w-auto h-auto object-contain"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Slider Dots */}
                  {product!.images && product!.images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                      {product!.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${idx === selectedImageIndex ? 'bg-primary' : 'bg-gray-300'}`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Desktop View */}
                <div className="hidden md:flex flex-col h-full w-full">
                  <div className="flex-1 flex items-center justify-center overflow-hidden mb-4">
                    <img
                      src={product!.images?.[selectedImageIndex] || product!.imageUrl}
                      alt={product!.name}
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                    />
                  </div>
                  {product!.images && product!.images.length > 1 && (
                    <div className="mt-2 overflow-x-auto pb-2">
                      <div className="flex space-x-3 justify-center">
                        {product!.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${idx === selectedImageIndex ? 'border-primary' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <img
                              src={img}
                              alt={`${product!.name} ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="w-full md:w-1/2">
            <h1 className="font-heading text-2xl md:text-3xl text-primary mb-2">{product!.name}</h1>
            
            <RatingStars rating={product!.rating} reviews={product!.totalReviews} size="md" />
            
            <p className="text-sm text-neutral-gray mb-6">{product!.shortDescription}</p>
            
            <div className="mb-6">
              <p className="font-heading text-xl text-primary">
                ₹{product!.price?.toFixed(2) ?? '0.00'}
                {product!.discountedPrice && (
                  <span className="ml-3 text-base text-neutral-gray line-through">
                    ₹{product!.discountedPrice?.toFixed(2) ?? '0.00'}
                  </span>
                )}
              </p>
              {product!.stock > 0 ? (
                <p className="text-sm text-green-600 mt-1">In Stock</p>
              ) : (
                <p className="text-sm text-red-500 mt-1">Out of Stock</p>
              )}
            </div>
            
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                <label htmlFor="quantity" className="text-neutral-gray text-sm sm:text-base">Quantity:</label>
                <div className="flex items-center border border-neutral-sand rounded-md w-fit">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 flex items-center justify-center text-foreground"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-10 sm:w-12 text-center border-x border-neutral-sand focus:outline-none text-sm sm:text-base"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-foreground"
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-black hover:bg-primary-light text-white uppercase tracking-wider py-4 sm:py-6 font-medium text-sm sm:text-base"
                  disabled={product!.stock <= 0}
                >
                  {product!.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button
                  onClick={() => handleBuyNow(product!)}
                  className="w-full bg-primary hover:bg-primary-light text-white uppercase tracking-wider py-4 sm:py-6 font-medium text-sm sm:text-base"
                >
                  Buy Now
                </Button>
              </div>
              <SocialShare
                url={window.location.href}
                title={product!.name}
                description={product!.shortDescription || product!.description}
                image={product!.images?.[selectedImageIndex] || product!.imageUrl}
              />
            </div>
            {/* Serviceability Check */}
        <div className="mt-4 border-t pt-4">
          <h3 className="font-heading text-lg text-primary mb-2">Check Estimated Delivery</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pincode}
              onChange={e => setPincode(e.target.value)}
              placeholder="Enter your pincode"
              maxLength={6}
              className="border p-2 rounded w-32"
            />
            <button
              onClick={handleCheckPincode}
              disabled={serviceLoading}
              className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {serviceLoading ? 'Checking...' : 'Check'}
            </button>
          </div>
          {serviceError && <p className="text-red-500 mt-2">{serviceError}</p>}
          {serviceData && serviceData.length > 0 && (
            <div className="mt-2 space-y-1">
              {serviceData[0].rate === 0 && <p className="text-green-600">Free Delivery Available</p>}
              <p>Estimated Delivery by {new Date(serviceData[0].estimated_delivery_date).toLocaleDateString()}</p>
              {(() => {
                const estDate = new Date(serviceData[0].estimated_delivery_date);
                const now = new Date();
                if ((estDate.getTime() - now.getTime()) <= 24 * 60 * 60 * 1000) {
                  return <p className="text-green-600">Guaranteed Shipping Within 24 hours</p>;
                }
                return null;
              })()}
              {(() => {
                const now = new Date();
                const cutoff = new Date();
                cutoff.setHours(14, 0, 0, 0);
                const estDate = new Date(serviceData[0].estimated_delivery_date);
                const estDateStr = estDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                if (now < cutoff) {
                  return <p>Order before 2 PM for Delivery by {estDateStr}</p>;
                }
                return <p>Order now for Delivery by {estDateStr} (orders placed after 2 PM ship next day)</p>;
              })()}
            </div>
          )}
        </div>
            <div className="prose prose-sm max-w-none text-neutral-gray mt-6">
              <h3 className="text-primary font-heading text-lg">Product Description</h3>
              <p>{product!.description}</p>
            </div>
          </div>
        </div>
        
        {/* Tabs - Description, Ingredients, How to Use, Reviews */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="bg-transparent h-auto p-0 w-full justify-start space-x-0">
                <TabsTrigger 
                  value="description" 
                  className="relative font-medium text-sm sm:text-base px-4 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger 
                  value="ingredients" 
                  className="relative font-medium text-sm sm:text-base px-4 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Ingredients
                </TabsTrigger>
                <TabsTrigger 
                  value="how-to-use" 
                  className="relative font-medium text-sm sm:text-base px-4 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  How to Use
                </TabsTrigger>

              </TabsList>
            </div>
            
            <TabsContent value="description" className="pt-6">
              <div className="prose max-w-none text-gray-700">
                <h3 className="text-xl font-medium text-gray-900 mb-4">Product Description</h3>
                <p className="mb-4">
                  Bringadi Intensive Hair Treatment Oil is a premium Ayurvedic hair oil formulated with natural ingredients 
                  to promote hair growth, reduce hair fall, and improve overall hair health. This intensive treatment oil 
                  is perfect for all hair types and is especially beneficial for those experiencing hair thinning or hair loss.
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  <li>Reduces hair fall and promotes new hair growth</li>
                  <li>Strengthens hair roots and prevents breakage</li>
                  <li>Nourishes the scalp and improves blood circulation</li>
                  <li>Prevents premature graying of hair</li>
                  <li>Suitable for all hair types</li>
                </ul>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Key Benefits:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Reduces hair fall by up to 90% with regular use</span>
                    </div>
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Promotes new hair growth</span>
                    </div>
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Strengthens hair roots</span>
                    </div>
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Improves scalp health</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ingredients" className="pt-6">
              <div className="prose max-w-none text-gray-700">
                <h3 className="text-xl font-medium text-gray-900 mb-4">Ingredients</h3>
                <p className="mb-4">
                  Our Bringadi Intensive Hair Treatment Oil is made with 100% natural and organic ingredients, 
                  carefully selected for their hair-nourishing properties:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  <li><strong>Bhringraj:</strong> Stimulates hair growth and prevents premature graying</li>
                  <li><strong>Amla:</strong> Nourishes hair and prevents dandruff</li>
                  <li><strong>Brahmi:</strong> Strengthens hair follicles and reduces hair fall</li>
                  <li><strong>Neem:</strong> Prevents scalp infections and dandruff</li>
                  <li><strong>Coconut Oil:</strong> Deeply conditions hair and prevents protein loss</li>
                  <li><strong>Almond Oil:</strong> Nourishes and adds shine to hair</li>
                  <li><strong>Fenugreek:</strong> Strengthens hair roots and promotes hair growth</li>
                </ul>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <h4 className="font-medium text-yellow-800 mb-2">100% Natural & Organic</h4>
                  <p className="text-yellow-700 text-sm">
                    Free from parabens, sulfates, artificial fragrances, and harsh chemicals. Safe for all hair types.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="how-to-use" className="pt-6">
              <div className="prose max-w-none text-gray-700">
                <h3 className="text-xl font-medium text-gray-900 mb-4">How to Use</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-4">1</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Apply to Scalp</h4>
                      <p className="mt-1 text-gray-600">
                        Take a small amount of Bringadi Intensive Hair Treatment Oil and apply it directly to your scalp. 
                        Use your fingertips to gently massage the oil into your scalp in circular motions for 5-10 minutes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-4">2</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Apply to Hair</h4>
                      <p className="mt-1 text-gray-600">
                        After massaging your scalp, apply the remaining oil to the length of your hair, focusing on the ends. 
                        For best results, use a wide-tooth comb to distribute the oil evenly.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-4">3</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Leave On</h4>
                      <p className="mt-1 text-gray-600">
                        Leave the oil on for at least 1-2 hours, or for best results, leave it overnight. 
                        For intensive treatment, you can wrap your hair in a warm towel or use a shower cap.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-4">4</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Wash Off</h4>
                      <p className="mt-1 text-gray-600">
                        Wash your hair with a mild shampoo. You might need to shampoo twice to remove all the oil. 
                        Follow with your regular conditioner.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-2">For Best Results:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
                    <li>Use 2-3 times a week for best results</li>
                    <li>Be consistent with the treatment for at least 3 months to see visible results</li>
                    <li>Store in a cool, dry place away from direct sunlight</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-6">
              <div className="px-2 sm:px-0">
                {reviewsLoading ? (
                  <div className="animate-pulse space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-neutral-200"></div>
                          <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                          <div className="h-4 w-16 bg-neutral-200 rounded"></div>
                        </div>
                        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">Error loading reviews. Please try again later.</p>
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b border-neutral-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-neutral-900">
                              {review.userName || 'Anonymous'}
                            </h4>
                            <div className="flex items-center mt-1">
                              <RatingStars rating={review.rating} size="md" />
                              <span className="ml-2 text-sm text-neutral-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-neutral-700 mt-2">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="mt-3 flex gap-2 overflow-x-auto">
                            {review.images.map((img, i) => (
                              <div key={i} className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded border border-neutral-200 overflow-hidden">
                                <img 
                                  src={img} 
                                  alt={`Review image ${i + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/placeholder.svg';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-primary mb-2">No Reviews Yet</h3>
                      <p className="text-neutral-600 mb-6">Be the first to share your thoughts about this product!</p>
                    </div>
                  </div>
                )}
                
                {isAuthenticated && !showReviewForm && (
                  <div className="text-center mt-8">
                    <Button 
                      onClick={() => setShowReviewForm(true)}
                      className="bg-primary hover:bg-primary-dark text-white py-2.5 px-6 text-base"
                    >
                      Write a Review
                    </Button>
                  </div>
                )}
                
                {showReviewForm && isAuthenticated && product?._id && (
                  <div className="mt-8 bg-white p-6 rounded-lg border border-neutral-200 max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Write a Review</h3>
                      <button 
                        onClick={() => setShowReviewForm(false)}
                        className="text-neutral-500 hover:text-neutral-700"
                        aria-label="Close review form"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <ReviewForm 
                      productId={product._id}
                      onClose={() => setShowReviewForm(false)}
                    />
                  </div>
                )}
                
                {!isAuthenticated && (
                  <div className="mt-8 text-center">
                    <p className="text-neutral-600 mb-4">Sign in to leave a review</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        asChild
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/5 py-2.5 px-6 text-base"
                      >
                        <a href={`/login?redirect=/products/${slug}`}>Sign In</a>
                      </Button>
                      <Button 
                        asChild
                        className="bg-primary hover:bg-primary-dark text-white py-2.5 px-6 text-base"
                      >
                        <a href={`/register?redirect=/products/${slug}`}>Create Account</a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="ingredients" className="pt-4 sm:pt-6">
              <div className="prose prose-sm sm:prose-base max-w-none text-neutral-gray px-2 sm:px-0">
                <div className="space-y-4">
                  <p className="leading-relaxed">
                    Our products are crafted with authentic Ayurvedic ingredients sourced directly 
                    from trusted suppliers across India. Each ingredient is carefully selected for 
                    its potency and purity, and is processed according to traditional Ayurvedic methods.
                  </p>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h4 className="font-medium text-primary mb-2">Key Ingredients:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {product?.ingredients?.split(',').map((ingredient: string, i: number) => (
                        <li key={i} className="text-sm sm:text-base">{ingredient.trim()}</li>
                      )) || <li>No specific ingredients listed</li>}
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
                    <h4 className="font-medium text-amber-800 mb-1">Free From:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm sm:text-base">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        No Parabens
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        No Sulfates
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        No Mineral Oil
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Cruelty Free
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="how-to-use" className="pt-4 sm:pt-6">
              <div className="prose prose-sm sm:prose-base max-w-none text-neutral-gray px-2 sm:px-0">
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-3">For Best Results:</h4>
                    <ol className="space-y-3">
                      <li className="flex items-start">
                        <span className="flex items-center justify-center bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex-shrink-0 mr-2 text-sm font-medium">1</span>
                        <span>Start with clean, dry skin/hair</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex items-center justify-center bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex-shrink-0 mr-2 text-sm font-medium">2</span>
                        <span>Take a small amount of product (about the size of a [coin/pea/almond])</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex items-center justify-center bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex-shrink-0 mr-2 text-sm font-medium">3</span>
                        <span>Gently massage in circular motions until fully absorbed</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex items-center justify-center bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex-shrink-0 mr-2 text-sm font-medium">4</span>
                        <span>Use {product?.usageFrequency || 'as needed'} for best results</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
                    <h4 className="font-medium text-amber-800 mb-2">Important Notes:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>For external use only</li>
                      <li>Avoid contact with eyes</li>
                      <li>Discontinue use if irritation occurs</li>
                      <li>Store in a cool, dry place away from direct sunlight</li>
                      <li>Keep out of reach of children</li>
                    </ul>
                  </div>
                  
                  <div className="text-sm text-neutral-500 italic">
                    <p>For detailed instructions specific to this product, please refer to the packaging or consult with an Ayurvedic practitioner.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading text-2xl text-primary">Customer Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center">
                <RatingStars 
                  rating={reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length} 
                  size="lg" 
                />
                <span className="ml-2 text-gray-600">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-neutral-200"></div>
                    <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                    <div className="h-4 w-16 bg-neutral-200 rounded"></div>
                  </div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading reviews. Please try again later.</p>
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-8">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-neutral-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-neutral-900">
                        {review.userName || 'Anonymous'}
                      </h4>
                      <div className="flex items-center mt-1">
                        <RatingStars rating={review.rating} size="md" />
                        <span className="ml-2 text-sm text-neutral-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-neutral-700 mt-2">{review.comment}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {review.images.map((img, i) => (
                        <div key={i} className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded border border-neutral-200 overflow-hidden">
                          <img 
                            src={img} 
                            alt={`Review image ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/placeholder.svg';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-primary mb-2">No Reviews Yet</h3>
                <p className="text-neutral-600 mb-6">Be the first to share your thoughts about this product!</p>
              </div>
            </div>
          )}

          <div className="mt-8">
            {isAuthenticated ? (
              showReviewForm ? (
                <div className="bg-white p-6 rounded-lg border border-neutral-200 max-w-2xl mx-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Write a Review</h3>
                    <button 
                      onClick={() => setShowReviewForm(false)}
                      className="text-neutral-500 hover:text-neutral-700"
                      aria-label="Close review form"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {product?._id && (
                    <ReviewForm 
                      productId={product._id}
                      onClose={() => setShowReviewForm(false)}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Button 
                    onClick={() => setShowReviewForm(true)}
                    className="bg-primary hover:bg-primary-dark text-white py-2.5 px-6 text-base"
                  >
                    Write a Review
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center">
                <p className="text-neutral-600 mb-4">Sign in to leave a review</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    asChild
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5 py-2.5 px-6 text-base"
                  >
                    <a href={`/login?redirect=/products/${slug}`}>Sign In</a>
                  </Button>
                  <Button 
                    asChild
                    className="bg-primary hover:bg-primary-dark text-white py-2.5 px-6 text-base"
                  >
                    <a href={`/register?redirect=/products/${slug}`}>Create Account</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        <div className="mt-16">
          <h2 className="font-heading text-2xl text-primary mb-8">You May Also Like</h2>
          <ProductCollection collectionSlug="bestsellers" title="" slider />
        </div>
      </div>
      <StickyAddToCart
        product={product!}
        quantity={quantity}
        setQuantity={setQuantity}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
