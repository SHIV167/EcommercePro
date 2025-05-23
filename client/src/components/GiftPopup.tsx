import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { X } from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface GiftProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
  // Additional fields from Product type that might be present
  sku?: string;
  slug?: string;
  categoryId?: string;
  imageUrl?: string;
}

interface GiftPopupConfig {
  _id?: string;
  title: string;
  subTitle: string;
  active: boolean;
  minCartValue: number;
  maxCartValue: number | null;
  maxSelectableGifts: number;
  giftProducts: string[];
}

// Grid layout component for gift products

export default function GiftPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<GiftPopupConfig | null>(null);
  const [giftProducts, setGiftProducts] = useState<GiftProduct[]>([]);
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, cartItems, addGiftToCart, removeItemFromCart } = useCart();
  const [dismissedUntilCartChange, setDismissedUntilCartChange] = useState(false);

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: config?.maxSelectableGifts || 2,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  // Load gift popup configuration and products
  useEffect(() => {
    const fetchGiftConfig = async () => {
      try {
        const response = await fetch('/api/gift-popup');
        if (!response.ok) throw new Error('Failed to fetch gift popup config');
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error('Error fetching gift popup config:', error);
      }
    };

    const fetchGiftProducts = async () => {
      try {
        const response = await fetch('/api/gift-products');
        if (!response.ok) throw new Error('Failed to fetch gift products');
        const data = await response.json();
        setGiftProducts(data);
      } catch (error) {
        console.error('Error fetching gift products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGiftConfig();
    fetchGiftProducts();
  }, []);

  // Reset dismissal and selection when cart changes
  useEffect(() => {
    setDismissedUntilCartChange(false);
    setSelectedGifts([]);
  }, [cart.id]);

  // Auto-remove all gift items when cart out of eligible range and control popup
  useEffect(() => {
    if (!config?.active || loading) return;
    const cartTotal = cart.totalPrice;
    const isCartEligible =
      cartTotal >= config.minCartValue &&
      (config.maxCartValue === null || cartTotal <= config.maxCartValue);

    // Remove all gift items from cart if not eligible
    if (!isCartEligible) {
      cartItems.filter(item => item.isGift).forEach(item => {
        const pid = (item.product as any)._id || (item.product as any).id;
        removeItemFromCart(pid);
      });
      setSelectedGifts([]);
    }

    // Show or hide popup
    setIsOpen(isCartEligible && !dismissedUntilCartChange && giftProducts.length > 0);
  }, [cart.totalPrice, config?.active, loading, giftProducts.length]);

  // Handle selecting a gift
  const handleSelectGift = (productId: string) => {
    // Enforce max selectable gifts
    if (!config) return;
    if (!selectedGifts.includes(productId) && selectedGifts.length >= (config.maxSelectableGifts || 2)) return;
    setSelectedGifts(prev => {
      // If already selected, remove it
      if (prev.includes(productId)) {
        removeItemFromCart(productId);
        return prev.filter(id => id !== productId);
      }
      
      // Otherwise, add it
      const product = giftProducts.find(p => p._id === productId);
      if (product) {
        addGiftToCart({
          _id: product._id,
          sku: `gift-${product._id}`,
          name: product.name,
          description: product.description || product.name,
          price: 0,
          imageUrl: product.images?.[0] || '',
          stock: 1,
          slug: `gift-${product._id}`,
          categoryId: 'gifts',
          images: product.images || [],
          faqs: [],
          customSections: [],
          structuredIngredients: [],
          structuredBenefits: [],
          howToUse: '',
          shortDescription: 'Complimentary gift',
          isGift: true
        } as any);
      }
      return [...prev, productId];
    });
  };

  // Handle closing the popup
  const handleClose = () => {
    setIsOpen(false);
    setDismissedUntilCartChange(true);
  };

  if (!isOpen || !config || loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <style>{`
          /* Custom styles for Slick slider */
          .slick-slide {
            padding: 0 10px;
          }
          .slick-list {
            margin: 0 -10px;
          }
          .slick-dots {
            bottom: -28px;
          }
          .slick-dots li button:before {
            font-size: 10px;
            color: #f59e0b;
            opacity: 0.5;
          }
          .slick-dots li.slick-active button:before {
            color: #d97706;
            opacity: 1;
          }
          .custom-arrow {
            display: flex !important;
            z-index: 10;
          }
          .next-arrow {
            right: -20px;
          }
          .prev-arrow {
            left: -20px;
          }
        `}</style>
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X size={20} />
        </button>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-6 text-center border-b">
          <h2 className="text-2xl font-bold text-amber-900">{config.title}</h2>
          <p className="text-amber-800 font-medium">{config.subTitle}</p>
        </div>
        
        {/* Complimentary Gifts - Slider */}
        <div className="px-12 py-6 flex-grow" style={{ maxHeight: 'calc(80vh - 180px)' }}>
          <div className="p-4">
            <Slider {...sliderSettings}>
              {giftProducts.map((product) => {
                const isSelected = selectedGifts.includes(product._id);
                return (
                  <div 
                    key={product._id}
                    className={`border rounded-lg overflow-hidden transition-all h-full flex flex-col ${
                      isSelected 
                        ? 'border-amber-500 ring-2 ring-amber-300 shadow-md' 
                        : 'border-gray-200 hover:border-amber-200'
                    }`}
                  >
                    <div className="relative pt-[100%] bg-gray-50">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="absolute inset-0 h-full w-full object-contain p-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).onerror = null;
                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="absolute inset-0 flex items-center justify-center"><span class="text-gray-400">No image</span></div>';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 flex-grow flex flex-col">
                      <h3 className="font-medium text-gray-900 truncate text-sm">{product.name}</h3>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-green-600 font-medium text-sm">Free</span>
                        <span className="text-gray-500 line-through text-xs">₹{product.price.toFixed(0)}</span>
                      </div>
                      <div className="flex-grow"></div>
                      
                      <button
                        onClick={() => handleSelectGift(product._id)}
                        className={`mt-3 w-full py-2 px-3 rounded-md transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : selectedGifts.length >= (config?.maxSelectableGifts || 2)
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        disabled={!isSelected && selectedGifts.length >= (config?.maxSelectableGifts || 2)}
                      >
                        {isSelected ? 'Selected' : 'Select Gift'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </Slider>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 flex justify-between items-center mt-auto">
          <div>
            <span className="text-gray-600 text-sm">
              {selectedGifts.length} of {config.maxSelectableGifts} gifts selected
            </span>
          </div>
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors text-sm"
          >
            {selectedGifts.length > 0 ? 'Continue with Selected Gifts' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  );
}
