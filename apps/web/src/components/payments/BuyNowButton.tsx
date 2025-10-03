'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface BuyNowButtonProps {
  product: Product;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BuyNowButton({
  product,
  variant = 'primary',
  size = 'md',
  className = '',
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleBuyNow = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          amount: product.price,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Redirect to checkout page
      router.push(`/checkout/${product.id}`);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      // In a real app, show error toast or notification
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBuyNow}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          <LoadingSpinner className="w-4 h-4 mr-2" />
          Processing...
        </>
      ) : (
        `Buy Now - $${(product.price / 100).toFixed(2)}`
      )}
    </Button>
  );
}
