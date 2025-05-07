import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get product ID from URL
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    // Check for a scanned coupon code in localStorage
    const couponCode = localStorage.getItem('scannedCouponCode');
    if (couponCode && product) {
      applyCoupon(couponCode);
      // Clear the coupon code from localStorage after attempting to apply it
      localStorage.removeItem('scannedCouponCode');
    }
  }, [product]);

  const applyCoupon = async (couponCode: string) => {
    try {
      const cartValue = product ? product.price : 0;
      const response = await axios.post('/api/coupons/validate', {
        code: couponCode,
        cartValue
      });
      if (response.data.valid) {
        const discountAmount = response.data.discount;
        setDiscount(discountAmount);
        toast.success(`Coupon ${couponCode} applied successfully! Discount: $${discountAmount}`);
      } else {
        toast.error(`Invalid coupon code: ${couponCode}`);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error(`Failed to apply coupon: ${couponCode}`);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    setCartLoading(true);
    try {
      await axios.post('/api/cart/add', { productId: id, quantity: 1 });
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center h-screen">Product not found</div>;
  }

  const discountedPrice = discount > 0 ? product.price - discount : product.price;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <img src={product.image} alt={product.name} className="w-full md:w-1/2 object-cover rounded-lg shadow-md" />
        <div className="flex flex-col gap-4 md:w-1/2">
          <p className="text-lg text-gray-700">{product.description}</p>
          <div className="price-section">
            {discount > 0 ? (
              <>
                <p className="text-2xl font-semibold text-gray-500 line-through">${product.price}</p>
                <p className="text-2xl font-semibold text-green-600">${discountedPrice} (Discount: ${discount})</p>
              </>
            ) : (
              <p className="text-2xl font-semibold text-green-600">${product.price}</p>
            )}
          </div>
          <button
            onClick={addToCart}
            disabled={cartLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {cartLoading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
