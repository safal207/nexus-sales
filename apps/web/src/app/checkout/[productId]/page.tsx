'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
}

interface PaymentIntent {
  clientSecret: string;
  id: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        // Fetch product details
        const productResponse = await fetch(`/api/products/${productId}`);
        if (!productResponse.ok) {
          throw new Error('Product not found');
        }
        const productData = await productResponse.json();
        setProduct(productData);

        // Create payment intent
        const paymentResponse = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: parseInt(productId),
            amount: productData.price,
          }),
        });

        if (!paymentResponse.ok) {
          throw new Error('Failed to create payment intent');
        }

        const paymentData = await paymentResponse.json();
        setPaymentIntent(paymentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize checkout');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      initializeCheckout();
    }
  }, [productId]);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    router.push(`/checkout/success?payment_intent=${paymentIntentId}`);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-600">Initializing checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !product || !paymentIntent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <Card className="p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Checkout Error
              </h1>
              <p className="text-gray-600 mb-6">
                {error || 'Failed to load product information'}
              </p>
              <Button onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Details */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{product.name}</span>
                </div>
                {product.description && (
                  <div>
                    <p className="text-gray-600 text-sm">{product.description}</p>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>${(product.price / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: paymentIntent.clientSecret,
                  appearance: {
                    theme: 'stripe',
                  },
                }}
              >
                <PaymentForm
                  clientSecret={paymentIntent.clientSecret}
                  amount={product.price}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}