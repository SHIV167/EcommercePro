import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';

// Define a local interface for gift card templates
interface GiftCardTemplate { _id: string; initialAmount: number; expiryDate: string; isActive: boolean; }

export default function GiftCardsPage() {
  const [templates, setTemplates] = useState<GiftCardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await apiRequest('GET', '/api/giftcards');
        const data = (await res.json()) as GiftCardTemplate[];
        setTemplates(data);
      } catch (err) {
        console.error('Failed to load gift card templates:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  if (loading) return <div className="container p-8 text-center">Loading gift cards...</div>;

  const sorted = templates.sort((a, b) => a.initialAmount - b.initialAmount);
  const defaultTemplate = sorted[0];

  return (
    <>
      <Helmet>
        <title>Gift Cards | Kama Ayurveda</title>
      </Helmet>
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-heading mb-6">Gift Cards</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sorted.map((tpl) => (
            <div key={tpl._id} className="border rounded-lg p-4 flex flex-col justify-between">
              <div>
                <p className="font-medium text-lg">{formatCurrency(tpl.initialAmount)}</p>
                <p className="text-sm text-neutral-gray mt-1">Valid until: {new Date(tpl.expiryDate).toLocaleDateString()}</p>
              </div>
              <Button
                onClick={() => addItem({
                  _id: tpl._id,
                  name: `Gift Card ${formatCurrency(tpl.initialAmount)}`,
                  price: tpl.initialAmount,
                } as any)}
                variant={tpl._id === defaultTemplate._id ? 'default' : 'outline'}
                className="mt-4"
              >
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
