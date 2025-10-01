'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { track } from '../../../utils/tracking';

const checkoutSchema = z.object({
  email: z.string().email({ message: 'A valid email is required.' }),
  name: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { productId } = params as { productId: string };

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const abVariant = useMemo(() => searchParams.get('v') ?? 'A', [searchParams]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);

    track({ name: 'page_view', productId, metadata: { abVariant, path: `/checkout/${productId}` } });

    try {
      const response = await fetch(`/api/public/products/${productId}`);
      if (response.status === 404) {
        throw new Error('This product could not be found. It may have been removed.');
      }
      if (!response.ok) {
        throw new Error('A network error occurred while fetching product details.');
      }
      const data = await response.json();
      setProduct(data.product as Product);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load product details.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [abVariant, productId]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  const onSubmit = async (data: CheckoutFormValues) => {
    setFormError(null);
    track({ name: 'submit_order_attempt', productId, metadata: { abVariant } });

    try {
      const response = await fetch('/api/public/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, productId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? 'An unknown error occurred');
      }

      track({ name: 'order_created', orderId: result.order.id, productId, metadata: { abVariant } });
      router.push(`/checkout/${productId}/success?orderId=${result.order.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order.';
      setFormError(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-12 bg-gray-300 rounded w-1/3 mx-auto mt-4" />
          <div className="h-10 bg-gray-200 rounded w-full mt-6" />
          <div className="h-10 bg-gray-200 rounded w-full" />
          <div className="h-12 bg-indigo-200 rounded w-full mt-4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-10">
        <h2 className="text-xl font-semibold text-red-600">An Error Occurred</h2>
        <p className="text-gray-600 mt-2">{error}</p>
        <button onClick={() => void fetchProduct()} className="mt-6 py-2 px-5 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">{product?.name}</h1>
        <p className="text-center text-gray-600">{product?.description}</p>
        <p className="text-4xl font-extrabold text-center text-gray-900">${(product?.price ?? 0) / 100}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              onChange={() => track({ name: 'start_checkout', productId, metadata: { abVariant } })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name (Optional)</label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          {formError && <p className="text-sm text-red-500 text-center">{formError}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            data-ab-variant={abVariant}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isSubmitting ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
        <div className="text-center text-xs text-gray-500">
          <span>🔒 Secure Checkout</span> &bull; <span>30-Day Money-Back Guarantee</span>
        </div>
      </div>
    </div>
  );
}