// apps/api/src/routes/stripeWebhook.ts
import type { Request, Response } from "express";
import { stripe } from "../services/stripe";
import { prisma } from "../prismaClient";
import type StripeType from "stripe";

export async function stripeWebhookHandler(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    return res.status(400).send("Missing stripe-signature");
  }

  let event: StripeType.Event;
  try {
    // bodyParser.raw fournit req.body comme Buffer
    const raw = (req as any).body;
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as StripeType.PaymentIntent;
    const email = pi.metadata?.email || "unknown@example.com";
    const currency = (pi.currency || "eur").toUpperCase();
    const totalCents = pi.amount_received || pi.amount || 0;

    let itemsMeta: { productId: string; qty: number; priceCents: number; slug: string; licenseType: "STANDARD" | "EXTENDED" }[] = [];
    if (pi.metadata?.items) {
      try {
        itemsMeta = JSON.parse(pi.metadata.items) as typeof itemsMeta;
      } catch {}
    }

    try {
      await prisma.order.create({
        data: {
          buyerEmail: email,
          currency,
          status: "PAID",
          totalCents,
          items: {
            create: itemsMeta.map((i) => ({
              productId: i.productId,
              priceCents: i.priceCents,
              currency,
              licenseType: i.licenseType,
            })),
          },
        },
      });
      return res.json({ received: true });
    } catch (e) {
      return res.status(500).json({ error: "Failed to persist order", detail: String(e) });
    }
  }

  // Accusé réception par défaut
  return res.json({ received: true });
}
