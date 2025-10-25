import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripeServerClient(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required for billing operations.');
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: '2024-06-20',
  });

  return stripeClient;
}
