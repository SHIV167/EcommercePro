import { Link } from "wouter";
import { Product } from "@shared/schema";
import RatingStars from "./RatingStars";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export default function ProductCard({ product, showAddToCart = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = () => {
    addItem(product);
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`
    });
  };
  
  return (
    <div className="product-card bg-white border border-neutral-sand p-6 hover:shadow-lg transition-all duration-300">
      <div className="relative mb-4">
        {product.isNew && (
          <span className="absolute top-2 left-2 bg-[#A72B1D] text-white text-xs px-2 py-1 uppercase tracking-wider z-10">
            New
          </span>
        )}
        {!product.isNew && product.featured && (
          <span className="absolute top-2 left-2 bg-neutral-darkGray text-white text-xs px-2 py-1 uppercase tracking-wider z-10">
            Featured
          </span>
        )}
        <Link href={`/products/${product.slug}`} className="block overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-64 object-contain hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>
      <div>
        <div className="mb-2">
          <RatingStars rating={product.rating} reviews={product.totalReviews} />
        </div>
        
        <h3 className="font-heading text-primary hover:text-primary-light mb-1 text-base line-clamp-2 min-h-[2.5rem]">
          <Link href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
        
        {product.shortDescription && (
          <p className="text-sm text-neutral-gray mb-3 line-clamp-2 min-h-[2.5rem]">{product.shortDescription}</p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <p className="font-medium text-primary">
            {formatCurrency(product.price)}
            {product.discountedPrice && (
              <span className="ml-2 text-sm text-neutral-gray line-through">
                {formatCurrency(product.discountedPrice)}
              </span>
            )}
          </p>
          
          {showAddToCart ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-primary hover:text-white hover:bg-primary rounded-full"
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </Button>
          ) : (
            <Button
              variant="outline" 
              size="sm"
              className="text-xs border-primary text-primary hover:bg-primary hover:text-white"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
