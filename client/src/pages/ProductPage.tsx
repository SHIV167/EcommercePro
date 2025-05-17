import { useState, useEffect } from "react";
import React from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product as BaseProduct, Review } from "@shared/schema";
import { Product, FAQ } from "@/types/product";
import ReviewForm from "@/components/product/ReviewForm";
import { Button } from "@/components/ui/button";
import RatingStars from "@/components/products/RatingStars";
import ProductCollection from "@/components/home/ProductCollection";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet";
import StickyAddToCart from "@/components/products/StickyAddToCart";
import { apiRequest } from "@/lib/queryClient";
import SocialShare from "@/components/products/SocialShare";
import ProductFAQ from "@/components/product/ProductFAQ";
import '@/styles/product-faq.css';
import BlogSection from '@/components/home/BlogSection';

// Extend Review type with server-enriched fields
type EnrichedReview = Review & { _id?: string; userName?: string };

const ProductPage: React.FC = () => {
  const { slug } = useParams();
  const [location, navigate] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [scannerEntry, setScannerEntry] = useState<any | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);

  const { data: product, isLoading: productLoading } = useQuery<BaseProduct & { faqs?: FAQ[] }>({
    queryKey: [`/api/products/${slug}`],
    queryFn: () => fetch(`/api/products/${slug}`).then(res => res.json()),
    enabled: !!slug,
  });

  const { data: reviews = [] } = useQuery<EnrichedReview[]>({
    queryKey: [`/api/products/${product?._id}/reviews`],
    queryFn: () => fetch(`/api/products/${product?._id}/reviews`).then(res => res.json()),
    enabled: !!product?._id,
  });

  const { data: bestsellers = [] } = useQuery<Product[]>({
    queryKey: ['bestsellersProducts'],
    queryFn: () => fetch('/api/products/bestsellers').then(res => res.json()),
    enabled: true,
  });

  const isDataReady = !productLoading && !!product;
  const extendedProduct = isDataReady ? { 
    ...product, 
    reviews, 
    relatedProducts: ((product as any)?.relatedProducts || []) as Product[],
    faqs: product?.faqs || [] // Use product FAQs from the database
  } : null;

  const ExtendedReviewForm = ReviewForm as unknown as React.FC<{ productId: string; onClose: () => void; onSubmit: (review: EnrichedReview) => void; }>;

  useEffect(() => {
    async function fetchPromoTimers() {
      const res = await fetch("/api/promotimers");
      const timers = await res.json();
      (window as any).PROMO_TIMERS = timers;
    }
    fetchPromoTimers();
  }, []);

  useEffect(() => {
    if (product?._id) {
      apiRequest("POST", "/api/scanners", {
        data: window.location.href,
        productId: product._id,
        scannedAt: new Date().toISOString()
      })
        .then(res => res.json())
        .then(entry => {
          setScannerEntry(entry);
          if (entry?.couponCode && !couponApplied) {
            toast({ title: "Coupon Applied" });
            setCouponApplied(true);
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

  const handleAddToCart = async () => {
    if (!extendedProduct) return;
    try {
      for (let i = 0; i < quantity; i++) {
        await addItem(extendedProduct!);
      }
      toast({ title: "Added to cart" });
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({ title: "Error adding to cart", description: error.message });
    }
  };

  const handleBuyNow = () => {
    if (!extendedProduct) return;
    addItem(extendedProduct!);
    navigate('/checkout');
  };

  useEffect(() => {
    if (product?.images && product.images.length > 1) {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const timer = setInterval(() => {
          setSelectedImageIndex(prev => (prev + 1) % product.images.length);
        }, 3000);
        return () => clearInterval(timer);
      }
    }
  }, [product?.images]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 50 && product?.images) {
      setSelectedImageIndex(prev => (prev + 1) % product.images.length);
    }
    if (touchEndX - touchStartX > 50 && product?.images) {
      setSelectedImageIndex(prev => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/uploads/fullbg_Desktop.png')", backgroundSize:"cover"}}>
      {!isDataReady ? (
        <div className="container mx-auto px-4 py-16 bg-white bg-opacity-50 rounded-md">
          {productLoading ? (
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Product...</h1>
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          )}
        </div>
      ) : (
        <>
          <Helmet>
            <title>{extendedProduct!.name} | Shiv Kumar jha</title>
            <meta name="description" content={extendedProduct!.shortDescription || extendedProduct!.description.substring(0, 160)} />
            <meta property="og:title" content={extendedProduct!.name} />
            <meta property="og:description" content={extendedProduct!.shortDescription || extendedProduct!.description.substring(0, 160)} />
            <meta property="og:image" content={extendedProduct!.images?.[0] || extendedProduct!.imageUrl} />
            <meta property="og:url" content={window.location.href} />
            <meta name="twitter:card" content="summary_large_image" />
          </Helmet>

          {scannerEntry?.couponCode && (
            <div className="bg-primary/10 text-primary p-4 text-center">
              <div className="container mx-auto">
                <p className="text-xl font-semibold">Special Offer!</p>
                <p>Use code <span className="font-bold">{scannerEntry.couponCode}</span> at checkout for extra savings.</p>
              </div>
            </div>
          )}

          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2">
                <div className="border border-neutral-sand p-2 sm:p-4 md:p-6 rounded-md overflow-hidden">
                  <div className="relative w-full flex flex-col">
                    {/* Mobile View */}
                    <div
                      className="md:hidden relative w-full h-[60vh]"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {extendedProduct!.images ? (
                        extendedProduct!.images.map((img, index) => (
                          <div key={index} className={`absolute inset-0 transition-opacity duration-500 ${selectedImageIndex === index ? "opacity-100" : "opacity-0"}`}>
                            <img
                              src={img}
                              alt={`${extendedProduct!.name} ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={extendedProduct!.imageUrl}
                            alt={extendedProduct!.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Mobile Dots Navigation */}
                    <div className="flex mt-2 space-x-2 md:hidden justify-center">
                      {extendedProduct!.images && extendedProduct!.images.map((_, index) => (
                        <div 
                          key={index}
                          className={`w-3 h-3 rounded-full cursor-pointer ${selectedImageIndex === index ? 'bg-primary' : 'bg-gray-300'}`}
                          onClick={() => setSelectedImageIndex(index)}
                        />
                      ))}
                    </div>
                    
                    {/* Desktop Image */}
                    <div className="hidden md:block relative w-full h-[60vh] mb-3">
                      <img
                        src={extendedProduct!.images?.[selectedImageIndex] || extendedProduct!.imageUrl}
                        alt={extendedProduct!.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    {/* Desktop Thumbnails */}
                    <div className="hidden md:flex justify-center items-center gap-3 mb-2">
                      {extendedProduct!.images && extendedProduct!.images.map((img, index) => (
                        <div 
                          key={index}
                          className={`relative cursor-pointer ${selectedImageIndex === index ? 'ring-2 ring-amber-500' : 'ring-1 ring-gray-200'}`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img 
                            src={img}
                            alt={`${extendedProduct!.name} thumbnail ${index + 1}`}
                            className="w-16 h-16 object-cover"
                          />
                          {index === 0 && (
                            <span className="absolute top-1 left-1 bg-black text-white text-xs px-1 rounded">NEW</span>
                          )}
                          {index === 1 && (
                            <span className="absolute top-1 left-1 bg-gray-700 text-white text-xs px-1 rounded">OLD</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{extendedProduct!.name}</h1>
                <p className="text-gray-700 mb-4">{extendedProduct!.description}</p>
                <div className="flex items-center mb-4">
                  <RatingStars rating={extendedProduct!.rating || 0} />
                  <span className="ml-2 text-gray-600">({extendedProduct!.reviews?.length || 0} reviews)</span>
                </div>
                <div className="mb-6">
                  <p className="font-heading text-xl text-primary">
                    { (extendedProduct as any).discountedPrice 
                      ? `₹${(extendedProduct as any).discountedPrice.toFixed(2)}` 
                      : `₹${extendedProduct!.price.toFixed(2)}` }
                    { (extendedProduct as any).discountedPrice && (
                      <span className="ml-3 text-base text-neutral-gray line-through">
                        ₹{extendedProduct!.price.toFixed(2)}
                      </span>
                    )}
                  </p>
                  <p className="text-sm mt-1">
                    {extendedProduct!.stock > 0 ? (
                      <span className="text-green-600">In Stock</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </p>
                </div>
                {/* Quantity Controls */}
                <div className="flex items-center space-x-2 mt-4">
                  <span className="font-medium">Quantity:</span>
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 bg-gray-100 rounded border focus:outline-none"
                  >
                    –
                  </button>
                  <span className="text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-3 py-1 bg-gray-100 rounded border focus:outline-none"
                  >
                    +
                  </button>
                </div>
                {/* Action Buttons */}
                <div className="flex space-x-4 mt-4">
                  <Button className="w-80 py-6" variant="default" onClick={() => handleAddToCart()}>Add To Cart</Button>
                  <Button className="w-80 py-6" variant="secondary" onClick={() => handleBuyNow()}>Buy Now</Button>
                </div>
                <SocialShare url={window.location.href} title={extendedProduct!.name} />
              </div>
            </div>

            {/* Product Information Sections */}
            <div className="mt-12 max-w-5xl mx-auto p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Offers Section */}
                <div className="w-full md:w-1/2 border-2 border-gray-800 rounded p-4 mb-6 bg-white">
                  <h2 className="text-xl font-heading text-center mb-4">Offers</h2>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <span className="text-gray-400 mr-2 w-6 text-center">➤</span>
                      <span className="text-sm">Choose any 1 complimentary gift worth upto Rs.2298 on orders above Rs.4000</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-gray-400 mr-2 w-6 text-center">➤</span>
                      <span className="text-sm">Choose any 2 complimentary gifts worth upto Rs.3998 on orders above Rs.6000</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-gray-400 mr-2 w-6 text-center">➤</span>
                      <span className="text-sm">Add Complementary NEW Premium Sample on every order!</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-gray-400 mr-2 w-6 text-center">➤</span>
                      <span className="text-sm">10% off on first order above Rs.1500 (Use Code: KAMA10)</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-gray-400 mr-2 w-6 text-center">➤</span>
                      <span className="text-sm">Upto Rs.768 cashback on "Exclusive Offer"</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-gray-400 mr-2 w-6 text-center">➤</span>
                      <span className="text-sm">Enjoy 30% "Premium Rewards" points on purchases with American Express®</span>
                    </li>
                  </ul>
                </div>

                {/* Check Pincode Availability */}
                <div className="w-full md:w-1/2 border-2 border-gray-800 rounded p-4 mb-6 bg-white">
                  <h2 className="text-xl font-heading text-center mb-4">Check Pincode Availability</h2>
                  <div className="flex items-center justify-center mb-3">
                    <input 
                      type="text" 
                      placeholder="Enter your pincode" 
                      className="border border-gray-200 rounded-l px-3 py-2 w-full focus:outline-none"
                    />
                    <button className="bg-gray-800 text-white px-4 py-2 rounded-r hover:bg-gray-700 transition">
                      Check
                    </button>
                  </div>
                  <p className="text-xs text-center text-gray-500 mb-4">Guaranteed Shipping Within 24 hours</p>
                  
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <h3 className="text-lg font-medium mb-2 text-center">Rewards</h3>
                    <p className="text-sm mb-2 text-center">
                      <span className="font-medium">Kama Ayurveda Loyalty Members can earn up to 535 points on purchase of this product.</span>
                    </p>
                    <div className="text-center">
                      <button className="text-primary text-sm font-medium hover:underline">
                        Know More
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinically Tested Section */}
              <section className="mb-10">
                <h2 className="text-xl font-heading text-center mb-4">Clinically Tested To</h2>
                <ul className="ml-2">
                  <li className="flex items-center">
                    <span className="text-black mr-2">•</span>
                    <span className="text-sm">Clinically Tested To Protect From UVA & UVB rays</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-2 ml-4">Based on clinical trials conducted over 30 days*</p>
              </section>

              {/* Natural Sunscreen Ingredients */}
              <section className="mb-12">
                <h2 className="text-xl font-heading text-center mb-4">Natural Sunscreen Top Ingredients</h2>
                <div className="mb-4">
                  <p className="text-sm mb-3">A light organic sunscreen containing natural origin, UV protection minerals such as <strong>Titanium Dioxide</strong> and <strong>Zinc Dioxide</strong> which protect the sun rays back from exposed skin. <strong>Natural Glycerine</strong> and <strong>Olive Oil</strong> condition skin without making it greasy. Nourishing <strong>Shea Butter</strong> protects, hydrates, repairs blemishes and other signs of sun damage. <strong>Pure essential oils</strong> - <strong>Nutmeg, Ginger and Lime</strong> have the anti-aging and fruity aromas.</p>
                  
                  <div className="border-2 border-black rounded py-5 my-6 px-6 relative">
                    <span className="absolute left-3 top-0 text-4xl font-bold text-amber-500">&ldquo;</span>
                    <p className="text-sm italic text-center px-8">
                      Did you know that Natural Sun Protection contains the natural mineral Zinc Oxide known as Yasad Bhasma, which protects from both UVA & UVB rays?
                    </p>
                    <span className="absolute right-3 bottom-0 text-4xl font-bold text-amber-500">&rdquo;</span>
                  </div>
                </div>
              </section>
              
              {/* Original Sections */}
              <h2 className="text-2xl font-heading text-primary mb-6 mt-10">Product Details</h2>
              
              {/* Ingredients Section */}
              <section className="mb-10 bg-[hsla(0, 9%, 94%, .4)]">
                <h2 className="text-xl font-heading text-primary mb-6">Ingredients</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="flex flex-col items-center">
                    <img src="/uploads/sections/kama_ingredients_updated_600x400_0059_ginger.jpg" alt="Lemon" className="w-40 h-50 rounded-full object-contain mb-2" />
                    <span className="text-sm text-center">Lemon</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src="/uploads/sections/kama_ingredients_updated_600x400_0059_ginger.jpg" alt="Honey" className="w-40 h-50 rounded-full object-contain mb-2" />
                    <span className="text-sm text-center">Honey</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src="/uploads/sections/kama_ingredients_updated_600x400_0059_ginger.jpg" alt="Milk" className="w-40 h-50 rounded-full object-contain mb-2" />
                    <span className="text-sm text-center">Milk</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src="/uploads/sections/kama_ingredients_updated_600x400_0059_ginger.jpg" alt="Vitamin E" className="w-40 h-50 rounded-full object-contain mb-2" />
                    <span className="text-sm text-center">Vitamin E</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src="/uploads/sections/kama_ingredients_updated_600x400_0059_ginger.jpg" alt="Aloe Vera" className="w-40 h-50 rounded-full object-contain mb-2" />
                    <span className="text-sm text-center">Aloe Vera</span>
                  </div>
                </div>
              </section>

              {/* How to Use Section */}
              <section className="mb-10">
                <h2 className="text-2xl font-heading text-center mb-6"><span className="text-green-600 font-bold">HOW TO</span> <span className="text-gray-800 font-bold">USE</span></h2>
                <div className="flex flex-col md:flex-row items-stretch border border-gray-100 rounded overflow-hidden">
                  {/* YouTube Video on the left */}
                  <div className="w-full md:w-1/2 bg-black">
                    <iframe 
                      className="w-full h-full min-h-[300px]"
                      src="https://www.youtube.com/embed/X4ZEVGac_VA" 
                      title="Product Usage Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  
                  {/* Steps on the right */}
                  <div className="w-full md:w-1/2 bg-white p-4">
                    <div>
                      <div className="mb-4">
                        <h3 className="text-base font-medium mb-1">Step 1: Prepare for the Day</h3>
                        <p className="text-sm text-gray-600">Take one capsule with water 30 minutes before breakfast to help control cravings and maintain healthy energy levels.</p>
                      </div>
                      
                      <div className="border-b border-gray-200 my-3"></div>
                      
                      <div className="mb-4">
                        <h3 className="text-base font-medium mb-1">Step 2: Keep It Going</h3>
                        <p className="text-sm text-gray-600">Take another capsule 30 minutes before dinner to continue supporting your appetite control.</p>
                      </div>
                      
                      <div className="border-b border-gray-200 my-3"></div>
                      
                      <div className="mb-1">
                        <h3 className="text-base font-medium mb-1">Step 3: Make It a Habit</h3>
                        <p className="text-sm text-gray-600">Add Curtail to your daily routine along with a healthy food and way of life for the best results.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Benefits Section */}
              <section className="mb-16">
                <h2 className="text-2xl font-heading text-center mb-8">Benefits</h2>
                
                {/* Benefit 1 - Natural & Safe */}
                <div className="flex flex-col md:flex-row mb-6 bg-[hsla(0, 9%, 94%, .6)]">
                  <div className="md:w-1/2 p-6 bg-gray-50 flex flex-col justify-center">
                    <h3 className="text-lg font-medium mb-2">99.3% Natural, Safe for Children & Daily Use</h3>
                    <p className="text-sm text-gray-600">This 99% base natural sunscreen for face is safe for children above 3 years old and for daily use for protection with fewer allergies.</p>
                  </div>
                  <div className="md:w-1/2 bg-white">
                    <img src="/uploads/sections/nnsunprot_1.jpg" alt="Natural sunscreen" className="w-full h-full object-cover" />
                  </div>
                </div>
                
                {/* Benefit 2 - SPF Protection */}
                <div className="flex flex-col md:flex-row mb-6 bg-[hsla(35, 63%, 95%, .6)]">
                  <div className="md:w-1/2 order-1 md:order-2 p-6 bg-white flex flex-col justify-center">
                    <h3 className="text-lg font-medium mb-2">SPF 21 & PA++ Sun Protection</h3>
                    <p className="text-sm text-gray-600">Titanium dioxide and Zinc Oxide are naturally occurring UV protection minerals that when nano-micronized provide SPF 21 and PA++ sun protection.</p>
                  </div>
                  <div className="md:w-1/2 order-2 md:order-1 bg-gray-50">
                    <img src="/uploads/sections/nnsunprot_2.jpg" alt="Sun protection" className="w-full h-full object-cover" />
                  </div>
                </div>
                
                {/* Benefit 3 - Repair */}
                <div className="flex flex-col md:flex-row mb-6 bg-[hsla(0, 9%, 94%, .6)]">
                  <div className="md:w-1/2 p-6 bg-gray-50 flex flex-col justify-center">
                    <h3 className="text-lg font-medium mb-2">Repairs Sunspots & Conditions Skin</h3>
                    <p className="text-sm text-gray-600">These butter extracts are aged and matured together, deeply nourishing and thus in condition the skin without making it feeling greasy, making it the perfect natural sunscreen for oily skin.</p>
                  </div>
                  <div className="md:w-1/2 bg-white">
                    <img src="/uploads/sections/nnsunprot_3.jpg" alt="Skin repair" className="w-full h-full object-cover" />
                  </div>
                </div>
                
                {/* Benefit 4 - Non-Nano */}
                <div className="flex flex-col md:flex-row bg-[hsla(35, 63%, 95%, .6)]">
                  <div className="md:w-1/2 order-1 md:order-2 p-6 bg-white flex flex-col justify-center">
                    <h3 className="text-lg font-medium mb-2">Non-Nano Formulation Based Sun Protector</h3>
                    <p className="text-sm text-gray-600">Non-Nano ZnO Oxide is the basic active minerals and filters out UVA & UVB rays protecting the skin from penetration and harm.</p>
                  </div>
                  <div className="md:w-1/2 order-2 md:order-1 bg-gray-50">
                    <img src="/uploads/sections/nnsunprot_4.jpg" alt="Non-nano formulation" className="w-full h-full object-cover" />
                  </div>
                </div>
              </section>
            </div>

            {/* Reviews Section */}
            <section className="mt-16 max-w-3xl mx-auto px-8 py-6 rounded">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-2xl text-primary">Reviews ({extendedProduct!.reviews?.length || 0})</h2>
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsReviewFormOpen(true)}
                    className="text-sm"
                  >
                    Write a Review
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="text-sm"
                  >
                    Write a Review
                  </Button>
                )}
              </div>
              {isReviewFormOpen && (
                <ExtendedReviewForm
                  productId={extendedProduct!._id || ""}
                  onClose={() => setIsReviewFormOpen(false)}
                  onSubmit={(review: EnrichedReview) => {
                    toast({ title: "Review submitted", description: "Your review has been saved successfully!" });
                    console.log("Review submitted:", review);
                    setIsReviewFormOpen(false);
                  }}
                />
              )}
              <div className="space-y-6">
                {extendedProduct!.reviews && extendedProduct!.reviews.length > 0 ? (
                  extendedProduct!.reviews.map((review: EnrichedReview) => (
                    <div key={review._id} className="bg-white p-4 rounded border border-gray-100">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <h3 className="font-bold mr-2">{review.userName || 'Anonymous'}</h3>
                          <RatingStars rating={review.rating || 0} />
                        </div>
                        <p className="mt-2 text-gray-700 whitespace-normal break-words">{review.comment || 'No comment provided.'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No reviews available</p>
                )}
              </div>
            </section>

            {/* FAQ Section */}
            <section className="py-12 max-w-4xl mx-auto px-8 border-2 border-black rounded-md my-10 bg-white">
              <h2 className="text-2xl font-heading text-primary mb-6 text-center">Frequently Asked Questions</h2>
              {extendedProduct?.faqs && extendedProduct.faqs.length > 0 ? (
                <ProductFAQ faqs={extendedProduct.faqs} />
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-md">
                  <p className="text-gray-600">No frequently asked questions are available for this product yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Check back soon or contact customer support if you have specific questions.</p>
                </div>
              )}
            </section>

            {/* Bestsellers */}
            <section className="py-8">
              <div className="container mx-auto px-4 py-6 rounded">
                <ProductCollection title="You May Also Like" collectionSlug="bestsellers" />
              </div>
            </section>

            {/* Blog Section */}
            <BlogSection />

            {/* Sticky Add to Cart */}
            {/* <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden">
              <div className="container mx-auto flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Price</span>
                  <div className="text-xl font-bold text-primary">${extendedProduct!.price}</div>
                </div>
                <Button onClick={handleAddToCart} className="px-8">
                  Add to Cart
                </Button>
              </div>
            </div> */}
            <StickyAddToCart product={extendedProduct!} quantity={quantity} setQuantity={setQuantity} onAddToCart={handleAddToCart} />
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPage;
