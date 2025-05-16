import { useState, useEffect } from "react";
import React from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, Review } from "@shared/schema";
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

  const { data: product, isLoading: productLoading } = useQuery<Product>({
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
  const extendedProduct = isDataReady ? { ...product, reviews, relatedProducts: ((product as any)?.relatedProducts || []) as Product[] } : null;

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
    <div className="min-h-screen bg-white">
      {!isDataReady ? (
        <div className="container mx-auto px-4 py-16">
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
                <div className="border border-neutral-sand p-2 sm:p-4 md:p-8 rounded-md overflow-hidden">
                  <div className="relative w-full aspect-square max-h-[70vh] flex flex-col">
                    <div
                      className="md:hidden relative w-full h-full"
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
                    <div className="flex mt-2 space-x-2 md:hidden justify-center">
                      {extendedProduct!.images && extendedProduct!.images.map((_, index) => (
                        <div 
                          key={index}
                          className={`w-3 h-3 rounded-full cursor-pointer ${selectedImageIndex === index ? 'bg-primary' : 'bg-gray-300'}`}
                          onClick={() => setSelectedImageIndex(index)}
                        />
                      ))}
                    </div>
                    <div className="hidden md:block relative w-full aspect-square max-h-[70vh]">
                      <img
                        src={extendedProduct!.images?.[selectedImageIndex] || extendedProduct!.imageUrl}
                        alt={extendedProduct!.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="hidden md:flex -mt-2 space-x-2 justify-center">
                      {extendedProduct!.images && extendedProduct!.images.map((img, index) => (
                        <img 
                          key={index}
                          src={img}
                          alt={`${extendedProduct!.name} thumbnail ${index + 1}`}
                          className={`w-16 h-16 object-cover cursor-pointer border ${selectedImageIndex === index ? 'border-primary' : 'border-transparent'}`}
                          onClick={() => setSelectedImageIndex(index)}
                        />
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
                  <Button variant="default" onClick={() => handleAddToCart()}>Add To Cart</Button>
                  <Button variant="secondary" onClick={() => handleBuyNow()}>Buy Now</Button>
                </div>
                <SocialShare url={window.location.href} title={extendedProduct!.name} />
              </div>
            </div>

            {/* Reviews Section */}
            <section className="mt-16 max-w-3xl mx-auto px-4">
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
                    <div key={review._id} className="bg-white p-4 rounded shadow-sm">
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

            {/* Bestsellers */}
            <section className="py-8">
              <div className="container mx-auto px-4">
                <ProductCollection title="Bestsellers" collectionSlug="bestsellers" />
              </div>
            </section>

            {/* Sticky Add to Cart */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden">
              <div className="container mx-auto flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Price</span>
                  <div className="text-xl font-bold text-primary">${extendedProduct!.price}</div>
                </div>
                <Button onClick={handleAddToCart} className="px-8">
                  Add to Cart
                </Button>
              </div>
            </div>
            <StickyAddToCart product={extendedProduct!} quantity={quantity} setQuantity={setQuantity} onAddToCart={handleAddToCart} />
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPage;
