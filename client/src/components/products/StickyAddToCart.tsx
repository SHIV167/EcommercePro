interface StickyAddToCartProps {
  product: any;
  quantity: number;
  setQuantity: (q: number) => void;
  onAddToCart: () => void;
}

export default function StickyAddToCart({ product, quantity, setQuantity, onAddToCart }: StickyAddToCartProps) {
  // Show only if product is loaded
  if (!product) return null;

  return (
    <>
      {/* Mobile sticky Add to Cart button */}
      <div 
        className="fixed bottom-0 left-0 right-0 md:hidden" 
        style={{
          width: '100%',
          zIndex: 999,
          backgroundColor: '#fff',
          borderTop: '1px solid #eee',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ padding: '8px' }}>
          <button
            onClick={onAddToCart}
            style={{
              width: '100%',
              height: '40px',
              backgroundColor: '#3f91eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
      
      {/* Desktop version */}
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
