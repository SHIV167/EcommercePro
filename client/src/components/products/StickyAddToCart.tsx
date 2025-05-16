import { useEffect } from 'react';

interface StickyAddToCartProps {
  product: any;
  quantity: number;
  setQuantity: (q: number) => void;
  onAddToCart: () => void;
}

// Function to handle mobile visibility
const setupMobileVisibility = () => {
  const mobileContainer = document.getElementById('mobile-add-to-cart-container');
  if (!mobileContainer) return;

  const checkScreenSize = () => {
    if (window.innerWidth < 768) { // Show only on mobile (under 768px)
      mobileContainer.style.display = 'flex';
      mobileContainer.style.justifyContent = 'center';
      mobileContainer.style.alignItems = 'center';
    } else {
      mobileContainer.style.display = 'none';
    }
  };

  // Initial check
  checkScreenSize();

  // Add event listener for window resize
  window.addEventListener('resize', checkScreenSize);

  // Cleanup function
  return () => window.removeEventListener('resize', checkScreenSize);
};

export default function StickyAddToCart({ product, quantity, setQuantity, onAddToCart }: StickyAddToCartProps) {
  // Set up mobile visibility on component mount
  useEffect(() => {
    const cleanup = setupMobileVisibility();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);
  // Show only if product is loaded
  if (!product) return null;

  return (
    <>
      {/* Mobile sticky Add to Cart button - only shown on mobile */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
        style={{
          display: 'none', // Hide by default
          padding: '8px',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
        id="mobile-add-to-cart-container"
      >
        <button
          onClick={onAddToCart}
          style={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            maxWidth: '100%',
            height: '44px',
            backgroundColor: '#3f91eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '15px',
            letterSpacing: '0.3px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '0 10px',
            boxSizing: 'border-box',
            WebkitTapHighlightColor: 'transparent',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease',
          }}
          onTouchStart={(e) => {
            // Add active state for better touch feedback
            const target = e.currentTarget;
            target.style.transform = 'scale(0.98)';
            target.style.opacity = '0.9';
            
            // Reset after animation completes
            setTimeout(() => {
              target.style.transform = '';
              target.style.opacity = '';
            }, 150);
          }}
        >
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            display: 'inline-block',
            padding: '0 4px',
          }}>
            Add to Cart • ₹{product.price}
          </span>
        </button>
      </div>
      
      {/* Desktop version - only shown on desktop */}
      <div className="fixed bottom-0 left-0 right-0 hidden md:flex bg-white shadow-2xl border border-neutral-sand rounded-t-xl items-center gap-4 px-6 py-4 w-full max-w-2xl mx-auto" style={{ zIndex: 999 }}>
        <img
          src={product.images?.[0] || product.imageUrl}
          alt={product.name}
          className="w-14 h-14 rounded object-cover border"
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate text-base text-primary">{product.name}</div>
          <div className="text-base font-bold text-green-700 md:text-lg">₹{product.price}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-lg font-bold text-primary border hover:bg-neutral-200"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            type="button"
          >-</button>
          <span className="w-8 text-center font-semibold">{quantity}</span>
          <button
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-lg font-bold text-primary border hover:bg-neutral-200"
            onClick={() => setQuantity(Math.min(10, quantity + 1))}
            aria-label="Increase quantity"
            type="button"
          >+</button>
        </div>
        <button
          className="h-12 ml-4 px-8 bg-primary hover:bg-primary-dark text-white font-bold"
          onClick={onAddToCart}
          style={{ backgroundColor: '#3f91eb', border: 'none', borderRadius: '4px' }}
        >
          Add to Cart
        </button>
      </div>
    </>
  );
}
