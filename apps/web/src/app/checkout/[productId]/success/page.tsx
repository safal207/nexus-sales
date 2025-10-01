'use client';

import { useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { track } from '../../../../utils/tracking';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const orderId = searchParams.get('orderId');
  const { productId } = params as { productId: string };

  useEffect(() => {
    track({ name: 'upsell_view', productId, orderId: orderId ?? undefined });
  }, [productId, orderId]);

  const handleUpsellClick = () => {
    track({ name: 'upsell_click', productId, orderId: orderId ?? undefined, metadata: { upsellProductId: 'upsell-prod-123' } });
    alert('This is just a placeholder! Thanks for your interest.');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 text-center bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
        <p className="mt-2 text-gray-700">Thank you for your purchase.</p>
        <p className="mt-1 text-sm text-gray-500">
          Your order ID is: <strong>{orderId ?? 'N/A'}</strong>
        </p>

        <div className="mt-8 p-6 border-t border-dashed">
          <h2 className="text-lg font-semibold text-gray-800">One Last Thing...</h2>
          <p className="mt-2 text-gray-600">Add our exclusive &ldquo;Advanced Techniques&rdquo; guide to your order for just $19.99!</p>
          <button
            onClick={handleUpsellClick}
            className="mt-4 w-full py-3 px-4 bg-orange-500 text-white rounded-md font-semibold hover:bg-orange-600"
          >
            Yes, Add to My Order!
          </button>
        </div>

        <Link href="/dashboard" className="mt-8 inline-block text-sm text-indigo-600 hover:underline">
          Go to your dashboard
        </Link>
      </div>
    </div>
  );
}