import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
} as const;

// Helper function to format amount for Stripe (cents to dollars)
export const formatAmountForStripe = (amount: number): number => {
  return amount; // Amount is already in cents in our database
};

// Helper function to format amount for display (cents to dollars)
export const formatAmountForDisplay = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
};