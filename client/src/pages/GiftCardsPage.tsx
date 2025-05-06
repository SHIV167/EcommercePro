import GiftCardForm from '@/components/GiftCardForm';
import { Helmet } from 'react-helmet';

export default function GiftCardsPage() {
  return (
    <>
      <Helmet>
        <title>eGift Card | Kama Ayurveda</title>
      </Helmet>
      <div className="container mx-auto py-12 px-4">
        <GiftCardForm />
        {/* Benefits Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="font-heading text-xl mb-4">Benefits</h2>
          <ul className="list-disc pl-6 text-neutral-gray space-y-2">
            <li>Seamless gifting solution, perfect for last-minute celebrations.</li>
            <li>eGift Card is sent directly via email for quick and easy gifting.</li>
            <li>Usable for purchasing from a wide selection of skincare, haircare, and wellness products.</li>
            <li>A sophisticated and thoughtful gift that offers a memorable indulgent experience.</li>
            <li>The Gift Card is valid for a period of 12 months from the date of issuance.</li>
          </ul>
          <div className="mt-4 text-xs text-neutral-gray">
            <span className="underline">Terms &amp; Conditions</span>
          </div>
        </div>
      </div>
    </>
  );
}
