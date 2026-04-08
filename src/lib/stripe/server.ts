import Stripe from "stripe";

declare global { var __stripe: Stripe | undefined; }

export function getStripe(): Stripe {
  if (globalThis.__stripe) return globalThis.__stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.__stripe = new Stripe(key, { apiVersion: "2025-03-31.basil" as any });
  return globalThis.__stripe;
}
