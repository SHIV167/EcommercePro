import React, { useRef, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";
import { Link } from "wouter";
import { CartContext } from "@/contexts/CartContext";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

// Extended Product type with our custom fields for UI display
interface ProductDisplay extends Omit<Product, 'customSections'> {
  // Add any additional fields needed for display
  rating?: number;
  reviewCount?: number;
  // Ensure customSections matches the expected type
  customSections: Array<{
    id: string;
    title: string;
    htmlContent: string;
    displayOrder: number;
    enabled: boolean;
  }>;
}

// Sample fallback products
const sampleProducts: ProductDisplay[] = [
  {
    _id: "1",
    sku: "THYRO001",
    name: "Thyrobik Capsule - Ayurvedic Thyroid Capsule",
    description: "Ayurvedic thyroid support capsule",
    shortDescription: "Natural thyroid support",
    price: 1990,
    discountedPrice: null,
    imageUrl: "/images/products/thyrobik.jpg",
    stock: 10,
    rating: 4.8,
    totalReviews: 12,
    slug: "thyrobik-capsule",
    categoryId: "thyroid",
    featured: true,
    bestseller: false,
    isNew: true,
    images: ["/images/products/thyrobik.jpg"],
    faqs: [],
    customSections: [],
    ingredients: "Natural herbs and extracts",
    structuredIngredients: [],
    benefits: "Supports healthy thyroid function",
    structuredBenefits: [],
    minOrderValue: 0,
    isFreeProduct: false,
    usageFrequency: "Twice daily"
  },
  {
    _id: "2",
    sku: "WEIGHT001",
    name: "Sheepala Curtail - Best Weight Loss Capsules",
    description: "Ayurvedic weight management capsule",
    shortDescription: "Natural weight management",
    price: 1499,
    discountedPrice: 1299,
    imageUrl: "/images/products/curtail.jpg",
    stock: 15,
    rating: 4.6,
    totalReviews: 24,
    slug: "sheepala-curtail",
    categoryId: "weight-loss",
    featured: true,
    bestseller: true,
    isNew: false,
    images: ["/images/products/curtail.jpg"],
    faqs: [],
    customSections: [],
    ingredients: "Natural herbs for weight management",
    structuredIngredients: [],
    benefits: "Supports healthy weight management",
    structuredBenefits: [],
    minOrderValue: 0,
    isFreeProduct: false,
    usageFrequency: "Once daily"
  },
  {
    _id: "3",
    sku: "DIAB001",
    name: "Diabtose+ - Ayurvedic Diabetes Management",
    description: "Ayurvedic diabetes management supplement",
    shortDescription: "Blood sugar support",
    price: 1699,
    discountedPrice: null,
    imageUrl: "/images/products/diabtose.jpg",
    stock: 8,
    rating: 4.7,
    totalReviews: 15,
    slug: "diabtose-plus",
    categoryId: "diabetes",
    featured: false,
    bestseller: false,
    isNew: true,
    images: ["/images/products/diabtose.jpg"],
    faqs: [],
    customSections: [],
    ingredients: "Herbs for blood sugar support",
    structuredIngredients: [],
    benefits: "Supports healthy blood sugar levels",
    structuredBenefits: [],
    minOrderValue: 0,
    isFreeProduct: false,
    usageFrequency: "Twice daily"
  }
];

export default function FeaturedProductsSection() {
  const sliderRef = useRef<Slider>(null);
  const { addItem } = useContext(CartContext);
  const { data: products = [], isLoading } = useQuery<ProductDisplay[]>({
    queryKey: ['/api/products/featured?limit=4'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/products/featured?limit=4');
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching featured products:", error);
        return [];
      }
    },
  });

  // Map products to ensure they match the expected Product type
  const displayProducts = (products.length > 0 ? products : sampleProducts).map(product => {
    // Create a base product with all required fields
    const baseProduct = {
      _id: product._id || '',
      sku: product.sku || `SKU-${product._id || '000'}`,
      name: product.name || 'Unnamed Product',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price || 0,
      discountedPrice: product.discountedPrice || null,
      imageUrl: product.imageUrl || '/images/placeholder-product.jpg',
      stock: product.stock || 0,
      rating: product.rating || 0,
      totalReviews: product.totalReviews || 0,
      slug: product.slug || `product-${product._id || 'unknown'}`.toLowerCase().replace(/\s+/g, '-'),
      categoryId: product.categoryId || 'uncategorized',
      featured: product.featured || false,
      bestseller: product.bestseller || false,
      isNew: product.isNew || false,
      images: product.images || [product.imageUrl || '/images/placeholder-product.jpg'],
      videoUrl: product.videoUrl || '',
      faqs: product.faqs || [],
      customSections: (product.customSections || []).map(section => ({
        id: section.id || Math.random().toString(36).substr(2, 9),
        title: section.title || '',
        htmlContent: section.htmlContent || '',
        displayOrder: section.displayOrder || 0,
        enabled: section.enabled !== false
      })),
      ingredients: product.ingredients || '',
      structuredIngredients: product.structuredIngredients || [],
      howToUse: product.howToUse || '',
      howToUseVideo: product.howToUseVideo || '',
      howToUseSteps: product.howToUseSteps || [],
      benefits: product.benefits || '',
      structuredBenefits: product.structuredBenefits || [],
      minOrderValue: product.minOrderValue || 0,
      isFreeProduct: product.isFreeProduct || false,
      usageFrequency: product.usageFrequency || ''
    };

    // Add our custom fields for display
    return {
      ...baseProduct,
      // Add our custom fields
      reviewCount: (product as any).reviewCount || 0
    };
  });

  // Custom arrow components for the slider
  const SliderArrow = ({ className, style, onClick, isNext = false }: any) => {
    return (
      <button
        onClick={onClick}
        className={`custom-nav-arrow absolute z-20 top-1/2 transform -translate-y-1/2 ${isNext ? 'right-4' : 'left-4'} rounded-full w-12 h-12 flex items-center justify-center focus:outline-none ${className}`}
        style={{
          backgroundColor: 'rgba(85, 128, 118, 0.85)',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.2s ease',
        }}
        aria-label={isNext ? 'Next slide' : 'Previous slide'}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 1)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 0.85)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        {isNext ? (
          <ChevronRight className="h-6 w-6 text-white" />
        ) : (
          <ChevronLeft className="h-6 w-6 text-white" />
        )}
      </button>
    );
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    nextArrow: <SliderArrow isNext={true} />,
    prevArrow: <SliderArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ],
    customPaging: () => (
      <div className="h-2 w-2 rounded-full bg-neutral-300 hover:bg-primary mt-4"></div>
    ),
  };

  return (
    <section className="py-12 bg-white featured-products-section">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl text-primary text-center mb-8">Featured Ayurvedic Products</h2>
        
        <div className="flex flex-col md:flex-row gap-6">          
          {/* Left side - Product slider (2/3 width on desktop) */}
          <div className="w-full md:w-2/3 relative">
            {/* Custom navigation buttons */}
            <button 
              onClick={() => sliderRef.current?.slickPrev()}
              className="custom-nav-arrow absolute z-20 top-1/2 transform -translate-y-1/2 left-4 rounded-full w-12 h-12 flex items-center justify-center focus:outline-none"
              style={{
                backgroundColor: 'rgba(85, 128, 118, 0.85)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease',
              }}
              aria-label="Previous slide"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 1)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 0.85)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <button 
              onClick={() => sliderRef.current?.slickNext()}
              className="custom-nav-arrow absolute z-20 top-1/2 transform -translate-y-1/2 right-4 rounded-full w-12 h-12 flex items-center justify-center focus:outline-none"
              style={{
                backgroundColor: 'rgba(85, 128, 118, 0.85)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease',
              }}
              aria-label="Next slide"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 1)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 0.85)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
            {isLoading ? (
              // Skeleton loading state
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="w-full h-64 rounded-lg" />
                    <Skeleton className="h-4 w-3/4 mt-3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                    <Skeleton className="h-10 w-full mt-4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 relative">
                <Slider ref={sliderRef} {...sliderSettings}>
                  {displayProducts.map((product) => (
                    <div key={product._id} className="px-2">
                      <ProductCard product={product} showAddToCart={true} />
                    </div>
                  ))}
                </Slider>
              </div>
            )}
          </div>
          
          {/* Right side - Banner (1/3 width on desktop) */}
          <div className="w-full md:w-1/3 mt-6 md:mt-0">
            <div className="h-full rounded-lg overflow-hidden border border-neutral-sand">
              <div className="h-full flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-4">AYURVEDIC<br />GOODNESS</h3>
                  <p className="text-lg text-primary uppercase mb-6">FOR YOUR HEALTH</p>
                  <img 
                    src="/uploads/sections/New_Kama_is_Kind_page_1.png" 
                    alt="Ayurvedic Products Collection" 
                    className="max-w-full h-auto rounded-md shadow-sm" 
                  />
                  <Link href="/collections/ayurvedic-essentials" className="mt-6 inline-block px-6 py-2 bg-primary hover:bg-primary-light text-white rounded-md transition-colors">
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dot indicators for mobile */}
        <div className="flex justify-center mt-4 md:hidden">
          <span className="h-2 w-2 rounded-full bg-primary mx-1"></span>
          <span className="h-2 w-2 rounded-full bg-gray-300 mx-1"></span>
          <span className="h-2 w-2 rounded-full bg-gray-300 mx-1"></span>
        </div>
      </div>
    </section>
  );
}