// apps/api/src/routes/payments.ts
import type { Request, Response } from "express";
import { createPaymentIntent } from "../services/stripe";

export async function initPayment(req: Request, res: Response) {
  try {
    const { amountCents, currency, email, items } = req.body as {
      amountCents: number;
      currency: string;
      email?: string;
      items?: { productId: string; slug: string; title: string; licenseType: "STANDARD" | "EXTENDED"; qty: number; priceCents: number }[];
    };

    // Validation des paramètres requis
    if (!amountCents || amountCents <= 0) {
      return res.status(400).json({ error: "Invalid amount: amountCents must be greater than 0" });
    }

    if (!currency || typeof currency !== "string") {
      return res.status(400).json({ error: "Invalid currency: currency is required" });
    }

    // Préparation des métadonnées
    const metadata: Record<string, string> = {};
    if (email) metadata.email = email;
    if (items && Array.isArray(items) && items.length > 0) {
      // Limiter la taille des métadonnées (Stripe limite à 500 caractères par clé)
      metadata.items = JSON.stringify(
        items.map((i) => ({
          productId: i.productId,
          qty: i.qty,
          priceCents: i.priceCents,
          slug: i.slug,
          licenseType: i.licenseType,
        }))
      );
    }

    // Créer le PaymentIntent
    const pi = await createPaymentIntent(amountCents, currency, metadata);
    
    if (!pi.client_secret) {
      return res.status(500).json({ error: "PaymentIntent created but no client_secret returned" });
    }

    return res.json({ 
      clientSecret: pi.client_secret, 
      paymentIntentId: pi.id 
    });
  } catch (e) {
    // Log de l'erreur pour le debugging
    console.error("Error in initPayment:", e);
    
    const errorMessage = e instanceof Error ? e.message : String(e);
    const errorDetail = e instanceof Error && "stack" in e ? (e as any).stack : undefined;
    
    return res.status(500).json({ 
      error: "Failed to init payment", 
      detail: errorMessage,
      ...(process.env.NODE_ENV === "development" && errorDetail ? { stack: errorDetail } : {}),
    });
  }
}
