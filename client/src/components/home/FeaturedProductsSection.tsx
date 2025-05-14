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
  stock?: number;
}

// Sample fallback products - Kumkumadi Collection
const sampleProducts: ProductDisplay[] = [
  {
    _id: "1",
    name: "Kumkumadi Miraculous Beauty Fluid",
    price: 1250,
    imageUrl: "/images/kumkumadi/fluid.jpg",
    rating: 4.8,
    reviewCount: 343,
    stock: 20
  },
  {
    _id: "2",
    name: "Kumkumadi Brightening Face Scrub",
    price: 899,
    imageUrl: "/images/kumkumadi/scrub.jpg",
    rating: 4.6,
    reviewCount: 271,
    stock: 15
  },
  {
    _id: "3",
    name: "Kumkumadi Night Cream",
    price: 1499,
    imageUrl: "/images/kumkumadi/cream.jpg",
    rating: 4.7,
    reviewCount: 198,
    stock: 8
  },
  {
    _id: "4",
    name: "Kumkumadi Face Oil",
    price: 1199,
    imageUrl: "/images/kumkumadi/oil.jpg",
    rating: 4.5,
    reviewCount: 320,
    stock: 20
  }
];

export default function FeaturedProductsSection() {
  const { addItem } = useContext(CartContext);
  const { data: products = [], isLoading } = useQuery<ProductDisplay[]>({
    queryKey: ['/api/products/kumkumadi?limit=4'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/products/kumkumadi?limit=4');
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching Kumkumadi products:", error);
        return [];
      }
    },
  });

  const displayProducts = products.length > 0 ? products : sampleProducts;

  return (
    <section className="py-12 bg-white featured-products-section">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-light text-gray-800">Kumkumadi Collection</h2>
          <a
            href="/shop?collection=Kumkumadi"
            className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors duration-300 text-sm font-medium"
          >
            VIEW ALL
          </a>
        </div>
        
        {/* Product grid - showing 4 products on desktop */}
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-full w-1/2 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded-full w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded-md w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <div key={product._id} className="bg-white h-full border border-neutral-sand rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                <Link href={`/product/${product._id}`} className="block h-full">
                  {/* Product image */}
                  <div className="relative h-48 bg-neutral-50">
                    <img 
                      src={product.imageUrl || '/images/product-placeholder.jpg'} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                    
                    {product.stock && product.stock < 5 && product.stock > 0 ? (
                      <span className="absolute top-2 left-2 bg-amber-600 text-white text-xs font-medium px-2 py-1 rounded">
                        Only {product.stock} left
                      </span>
                    ) : product.stock === 0 ? (
                      <span className="absolute top-2 left-2 bg-neutral-600 text-white text-xs font-medium px-2 py-1 rounded">
                        Out of stock
                      </span>
                    ) : null}
                  </div>
                  
                  {/* Product info */}
                  <div className="p-4">
                    <h3 className="text-base font-medium text-neutral-800 mb-2 line-clamp-2 h-12">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      {Array(5).fill(0).map((_, index) => (
                        <svg 
                          key={index}
                          className={`w-4 h-4 ${index < Math.floor(product.rating || 0) ? 'text-yellow-500' : 'text-neutral-300'}`}
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-neutral-gray ml-1">{product.reviewCount || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-medium text-primary">
                        {formatCurrency(product.price || 0)}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          if (product._id) {
                            addItem({ 
                              _id: product._id, 
                              name: product.name || '', 
                              price: product.price || 0,
                              imageUrl: product.imageUrl || '',
                              sku: product.sku || '',
                              description: product.description || '',
                              stock: product.stock || 0,
                              slug: product.slug || '',
                              categoryId: product.categoryId || '',
                              images: product.images || []
                            });
                          }
                        }}
                        className="px-3 py-2 bg-primary hover:bg-primary-light text-white rounded-md text-sm transition-colors"
                        disabled={!(product.stock && product.stock > 0)}
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
