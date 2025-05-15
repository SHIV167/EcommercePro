import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [bg, setBg] = useState<string>('');
  const [enabled, setEnabled] = useState(false);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Get the base API URL from environment variables or use relative path
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  useEffect(() => {
    const fetchPopupSettings = async () => {
      try {
        const apiUrl = `${API_BASE_URL}/api/popup-settings`;
        console.log('Fetching popup settings from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include' // Important for cookies, authorization headers with HTTPS
        });

        console.log('Newsletter popup fetch status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.warn('Popup settings response not OK:', response.status, errorText.slice(0, 200) + (errorText.length > 200 ? '... [truncated]' : ''));
          setEnabled(false);
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.warn('Received non-JSON response:', contentType, text.slice(0, 200) + (text.length > 200 ? '... [truncated]' : ''));
          setEnabled(false);
          return;
        }

        const data = await response.json().catch(error => {
          console.error('JSON parse error:', error);
          throw new Error(`JSON parse error: ${error.message}`);
        });
        console.log('Processed popup settings from API:', data);
        
        // Handle different response formats
        const settingsData = data?.data || data || {};
        setBg(settingsData.bgImage || '');
        setEnabled(!!settingsData.enabled);
        setStart(settingsData.startDate || null);
        setEnd(settingsData.endDate || null);
        
      } catch (error) {
        console.error('Error fetching popup settings:', error);
        setEnabled(false);
      }
    };

    fetchPopupSettings();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const now = new Date();
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;
    if ((s && now < s) || (e && now > e)) return;
    setShow(true);
  }, [enabled, start, end]);

  if (!show) return null;

  const onClose = () => {
    setShow(false);
    setMessage(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email');
      return;
    }
    
    try {
      const apiUrl = `${API_BASE_URL}/api/newsletter/subscribe`;
      console.log('Subscribing to newsletter at:', apiUrl);
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Important for cookies, authorization headers with HTTPS
        body: JSON.stringify({ email }),
      });
      
      console.log('Subscription response status:', res.status);
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', contentType, text.slice(0, 200) + (text.length > 200 ? '... [truncated]' : ''));
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await res.json().catch(error => {
        console.error('JSON parse error:', error);
        throw new Error(`JSON parse error: ${error.message}`);
      });
      console.log('Subscription response data:', data);
      
      if (res.ok) {
        setMessage(data.message || 'Subscribed successfully');
        setTimeout(() => onClose(), 2000);
      } else {
        setMessage(data.message || 'Failed to subscribe');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen">
      <div className="bg-white rounded-lg overflow-hidden max-w-md w-full relative flex flex-col items-center justify-center"
           style={{
             backgroundImage: bg ? `url(${bg})` : 'url(/images/newsletter-bg.jpg)',
             backgroundSize: 'cover',
             height: '50vh'
           }}>
        <button onClick={onClose} className="absolute top-2 right-2 text-black">✕</button>
        <div className="p-6 bg-white bg-opacity-90">
          <h2 className="text-2xl mb-4">Subscribe to our Newsletter</h2>
          <form onSubmit={onSubmit} className="flex flex-col items-center justify-center space-y-4">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="border p-2 rounded mb-4"
            />
            <button type="submit" className="bg-primary text-white p-2 rounded">Subscribe</button>
          </form>
          {message && <div className="mt-4 text-center text-sm text-white bg-black bg-opacity-50 p-2 rounded">{message}</div>}
        </div>
      </div>
    </div>
  );
}
