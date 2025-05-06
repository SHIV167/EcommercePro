import { useState } from 'react';
import { Button } from '@/components/ui/button';

const GIFT_AMOUNTS = [500, 1000, 2000, 5000];

export default function GiftCardForm() {
  const [amount, setAmount] = useState(1000);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div className="flex flex-col md:flex-row gap-12 items-start">
      {/* Left: Card Image and thumbnail */}
      <div className="flex flex-col items-center w-full md:w-1/2">
        <img
          src="/giftcard_main.png"
          alt="eGift Card"
          className="w-80 h-56 object-contain rounded shadow mb-2 border"
        />
        <div className="flex justify-center mt-2">
          <img
            src="/giftcard_main.png"
            alt="eGift Card Thumbnail"
            className="w-12 h-12 object-contain rounded border"
          />
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full md:w-1/2 max-w-lg">
        <h1 className="font-heading text-2xl mb-2">eGift Card</h1>
        <p className="text-sm text-neutral-gray mb-2">Country of Origin: <span className="text-black">India</span></p>
        <p className="mb-4 text-neutral-gray">An exceptional gift that promises a touch of personalized luxury! Give the gift of choice with Kama Ayurveda eGift Card.</p>
        <label className="block font-medium mb-1">Select Gift Card Amount *</label>
        <input
          type="range"
          min={GIFT_AMOUNTS[0]}
          max={GIFT_AMOUNTS[GIFT_AMOUNTS.length-1]}
          step={500}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full mb-2 accent-primary"
        />
        <div className="mb-4 font-bold">₹ {amount}</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            className="border p-2 rounded"
            placeholder="Sender's Name*"
            value={senderName}
            onChange={e => setSenderName(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Sender's Email Id*"
            value={senderEmail}
            onChange={e => setSenderEmail(e.target.value)}
            type="email"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            className="border p-2 rounded"
            placeholder="Receiver's Name*"
            value={receiverName}
            onChange={e => setReceiverName(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Receiver's Email Id*"
            value={receiverEmail}
            onChange={e => setReceiverEmail(e.target.value)}
            type="email"
          />
        </div>
        <textarea
          className="border p-2 rounded w-full mb-4"
          placeholder="Message*"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
        />
        <div className="flex gap-4">
          <Button className="bg-white text-black border border-black px-8">Buy Now</Button>
          <Button className="bg-black text-white px-8">Add To Bag</Button>
        </div>
      </div>
    </div>
  );
}
