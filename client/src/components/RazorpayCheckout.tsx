import React, { useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface RazorpayCheckoutProps {
  amount: number; // in paise, e.g. ₹100 => 10000
  currency?: string;
  onSuccess: (payment: any) => void;
  onError?: (error: any) => void;
}

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
};

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({ amount, currency = 'INR', onSuccess, onError }) => {
  useEffect(() => {
    loadScript('https://checkout.razorpay.com/v1/checkout.js')
      .catch(err => console.error(err));
  }, []);

  const handlePayment = async () => {
    try {
      // fetch key id
      const cfg = await apiRequest('GET', '/api/config').then(res => res.json());
      // create order
      const { orderId, amount: amt } = await apiRequest('POST', '/api/razorpay/order', { amount, currency }).then(res => res.json());
      const options: any = {
        key: cfg.razorpayKeyId,
        amount: amt,
        currency,
        order_id: orderId,
        handler: (res: any) => onSuccess(res),
        prefill: {},
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (err: any) => onError?.(err));
      rzp.open();
    } catch (err) {
      console.error('Razorpay init error:', err);
      onError?.(err);
    }
  };

  return (
    <button onClick={handlePayment} className="btn-primary">
      Pay ₹{(amount / 100).toFixed(2)}
    </button>
  );
};

export default RazorpayCheckout;
