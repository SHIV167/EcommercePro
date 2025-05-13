import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "../../../../shared/schema";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { CartContext } from "@/contexts/CartContext";

// Extended Product type with our custom fields for UI display
interface ProductDisplay extends Partial<Product> {
  rating?: number;
  reviewCount?: number;
  // Using the correct property name from Product schema
  stock?: number;
}

// Sample fallback products
const sampleProducts: ProductDisplay[] = [
  {
    _id: "1",
    name: "Thyrobik Capsule - Ayurvedic Thyroid Capsule",
    price: 1990,
    imageUrl: "/images/products/thyrobik.jpg",
    rating: 4.8,
    reviewCount: 343,
    stock: 10
  },
  {
    _id: "2",
    name: "Sheepala Curtail - Best Weight Loss Capsules for Fast & Effective Results",
    price: 1499,
    imageUrl: "/images/products/curtail.jpg",
    rating: 4.6,
    reviewCount: 471,
    stock: 15
  },
  {
    _id: "3",
    name: "Diabtose+ - Ayurvedic Diabetes Management",
    price: 1699,
    imageUrl: "/images/products/diabtose.jpg",
    rating: 4.7,
    reviewCount: 298,
    stock: 8
  }
];

export default function FeaturedProductsSection() {
  const { addItem } = useContext(CartContext);
  const { data: products = [], isLoading } = useQuery<ProductDisplay[]>({
    queryKey: ['/api/products/featured?limit=3'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/products/featured?limit=3');
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching featured products:", error);
        return [];
      }
    },
  });

  const displayProducts = products.length > 0 ? products : sampleProducts;

  const handleAddToCart = async (product: ProductDisplay) => {
    if (product._id && product.price) {
      try {
        // Using the context's addItem function which expects a full Product
        await addItem(product as Product);
        // Show a simple alert since we don't have the fancy toast system
        alert(`${product.name} has been added to your cart`);
      } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Failed to add item to cart");
      }
    }
  };

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl text-primary text-center mb-8">Featured Ayurvedic Products</h2>
        
        <div className="relative">
          {/* Previous/Next buttons for mobile */}
          <button className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              // Render skeleton cards when loading
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 mb-4 rounded-md"></div>
                  <div className="w-3/4 h-6 bg-gray-200 mb-2"></div>
                  <div className="w-full h-4 bg-gray-200 mb-4"></div>
                  <div className="flex mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-gray-200 mr-1 rounded-full"></div>
                    ))}
                    <div className="w-8 h-4 bg-gray-200 ml-2"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 mb-4"></div>
                  <div className="w-full h-10 bg-gray-200 rounded-md"></div>
                </div>
              ))
            ) : (
              displayProducts.map((product) => (
                <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <Link to={`/product/${product._id}`}>
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={product.imageUrl || '/images/placeholder.jpg'} 
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="font-medium text-sm text-gray-800 mb-2 h-10 line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {renderStars(product.rating || 5)}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">{product.reviewCount || 0}</span>
                    </div>
                    
                    <div className="font-semibold mb-3 text-gray-900">
                      {formatCurrency(product.price || 0)}
                    </div>
                    
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2 px-4 bg-white border border-secondary text-secondary rounded hover:bg-secondary hover:text-white transition-colors text-sm font-medium"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Next button for mobile */}
          <button className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
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
