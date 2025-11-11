// apps/api/src/services/stripe.ts
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}

// Utiliser la dernière version API supportée par la bibliothèque Stripe
// En omettant apiVersion, Stripe utilise automatiquement la dernière version compatible
export const stripe = new Stripe(stripeSecretKey);

export async function createPaymentIntent(amountCents: number, currency: string, metadata?: Record<string, string>) {
  try {
    return await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: metadata ?? {},
    });
  } catch (error: any) {
    // Gérer les erreurs Stripe
    if (error && typeof error === "object" && error.type) {
      throw new Error(`Stripe API Error: ${error.message || "Unknown error"} (type: ${error.type})`);
    }
    throw error;
  }
}

export default stripe;
