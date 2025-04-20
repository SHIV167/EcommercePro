import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/products/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";

export default function BestsellerSection() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/bestsellers?limit=4'],
  });

  return (
    <section className="py-12 bg-neutral-cream">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl text-primary text-center mb-10">Bestsellers</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            // Render skeleton cards when loading
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-neutral-sand p-4 animate-pulse">
                <div className="mb-4 w-full h-48 bg-neutral-sand"></div>
                <div className="w-24 h-3 bg-neutral-sand mb-2"></div>
                <div className="w-full h-5 bg-neutral-sand mb-1"></div>
                <div className="w-16 h-4 bg-neutral-sand"></div>
              </div>
            ))
          ) : (
            products.map((product) => (
              <div key={product.id} className="product-card bg-white border border-neutral-sand p-4">
                <div className="mb-4">
                  <Link href={`/products/${product.slug}`}>
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-48 object-contain"
                    />
                  </Link>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <div className="flex text-secondary">
                      {Array.from({ length: Math.floor(product.rating) }).map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      {product.rating % 1 !== 0 && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-neutral-gray ml-1">({product.totalReviews})</span>
                  </div>
                  <h3 className="font-heading text-primary hover:text-primary-light text-sm md:text-base mb-1">
                    <Link href={`/products/${product.slug}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <p className="font-medium text-primary">₹{product.price.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="text-center mt-10">
          <Button 
            asChild
            variant="outline"
            className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white uppercase tracking-wider py-3 px-8 font-medium text-sm transition-colors duration-300"
          >
            <Link href="/collections/bestsellers">View All Bestsellers</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
