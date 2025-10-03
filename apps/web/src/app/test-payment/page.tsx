'use client';

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { Card } from '@/components/ui/Card';

export default function TestPaymentPage() {
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    // Create a test payment intent for $10.00
    const createTestPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: 1, // Test product ID
            amount: 1000, // $10.00 in cents
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setClientSecret(data.clientSecret);
        }
      } catch (error) {
        console.error('Error creating test payment intent:', error);
      }
    };

    createTestPaymentIntent();
  }, []);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    alert(`Payment successful! Payment Intent ID: ${paymentIntentId}`);
  };

  const handlePaymentError = (errorMessage: string) => {
    alert(`Payment failed: ${errorMessage}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Payment</h1>
          <p className="text-gray-600 mt-2">Test Stripe payment integration</p>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Test Product</h2>
            <p className="text-gray-600">Test payment of $10.00</p>
          </div>

          {clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                amount={1000}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading payment form...</p>
            </div>
          )}
        </Card>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Test Card Details</h3>
          <p className="text-blue-800 text-sm">
            Use test card: <code className="bg-blue-100 px-2 py-1 rounded">4242 4242 4242 4242</code>
          </p>
          <p className="text-blue-800 text-sm mt-1">
            Any future expiry date and CVC will work for testing.
          </p>
        </div>
      </div>
    </div>
  );
}
