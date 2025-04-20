import { useState, useRef } from "react";
import { Link } from "wouter";
import ProductCard from "@/components/products/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { Product, Collection } from "@shared/schema";

interface ProductCollectionProps {
  collectionSlug: string;
  title?: string;
}

export default function ProductCollection({ collectionSlug, title }: ProductCollectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: collection } = useQuery<Collection>({
    queryKey: [`/api/collections/${collectionSlug}`],
  });
  
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: [`/api/collections/${collectionSlug}/products`],
  });

  const productsPerPage = 3;
  const totalPages = Math.ceil(products.length / productsPerPage);
  
  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const displayProducts = products.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );
  
  const collectionTitle = title || collection?.name || "Featured Collection";

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-heading text-2xl text-primary">{collectionTitle}</h2>
          <Link href={`/collections/${collectionSlug}`} className="text-sm text-neutral-gray hover:text-primary">
            View All
          </Link>
        </div>
        
        <div className="relative" ref={containerRef}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              // Render skeleton cards if no products
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-neutral-sand p-6 animate-pulse">
                  <div className="mb-4 w-full h-64 bg-neutral-sand"></div>
                  <div className="w-24 h-3 bg-neutral-sand mb-2"></div>
                  <div className="w-full h-5 bg-neutral-sand mb-1"></div>
                  <div className="w-3/4 h-4 bg-neutral-sand mb-3"></div>
                  <div className="w-16 h-4 bg-neutral-sand"></div>
                </div>
              ))
            )}
          </div>
          
          {/* Collection Navigation Controls - only show if there are multiple pages */}
          {totalPages > 1 && (
            <>
              <button 
                className={`absolute -left-4 md:-left-6 top-1/2 transform -translate-y-1/2 bg-white border border-neutral-sand ${currentPage === 0 ? 'text-neutral-gray' : 'hover:border-primary text-primary'} rounded-full p-2 shadow-sm`}
                aria-label="Previous products"
                onClick={handlePrev}
                disabled={currentPage === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                className={`absolute -right-4 md:-right-6 top-1/2 transform -translate-y-1/2 bg-white border border-neutral-sand ${currentPage === totalPages - 1 ? 'text-neutral-gray' : 'hover:border-primary text-primary'} rounded-full p-2 shadow-sm`}
                aria-label="Next products"
                onClick={handleNext}
                disabled={currentPage === totalPages - 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
