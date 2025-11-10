// apps/api/src/routes/checkout.ts
import type { Request, Response } from "express";
import { prisma } from "../prismaClient";
import { z } from "zod";

// Schéma Zod: décrit et valide la forme exacte de la payload Checkout
// Pense-le comme des "PropTypes runtime" pour ton endpoint.
// Avantages: messages d'erreur clairs, types TS inférés, même logique utilisable côté front.
const CheckoutItemSchema = z.object({
  productId: z.string().min(1, "productId requis"),
  slug: z.string().min(1, "slug requis"),
  title: z.string().min(1, "title requis"),
  licenseType: z.enum(["STANDARD", "EXTENDED"], { errorMap: () => ({ message: "licenseType invalide" }) }),
  qty: z.number().int().min(1, "qty doit être >= 1"),
  priceCents: z.number().int().min(0, "priceCents doit être >= 0"),
  currency: z.string().min(1, "currency requis"),
});

const CheckoutPayloadSchema = z.object({
  email: z.string().email("Email invalide"),
  country: z.string().min(2, "Pays requis"),
  items: z.array(CheckoutItemSchema).min(1, "Au moins 1 item"),
});

export async function initCheckout(req: Request, res: Response) {
  try {
    // 1) Valider la payload avec Zod (sécurise l'endpoint)
    // safeParse ne jette pas d'exception; on renvoie une erreur 400 avec le détail
    const parsed = CheckoutPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      // Format d'erreurs lisible et stable pour le front
      return res.status(400).json({
        error: "Invalid checkout payload",
        detail: parsed.error.format(),
      });
    }

    const { email, country, items } = parsed.data;

    // 2) Calculer le total (mock côté API)
    // C'est un "derived state" depuis les items — exactement comme un calcul de total en React
    const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
    const currency = items[0]?.currency ?? "EUR";

    // 3) Vérifier l'existence des produits (sanity-check)
    // Côté UX on veut éviter de valider une commande avec des IDs inconnus
    const productIds = items.map((i) => i.productId);
    const existing = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    if (existing.length !== productIds.length) {
      return res.status(400).json({ error: "Some products not found" });
    }

    // 4) Mock confirmation (pas d'Order réel ici — on valide l'UX du flow)
    // Pense à ça comme à un "navigate" côté back: on renvoie l'info que le front va afficher
    const confirmationId = `chk_${Math.random().toString(36).slice(2, 10)}`;

    return res.json({
      ok: true,
      confirmationId,
      email,
      country,
      totalCents,
      currency,
      message: "Checkout initialized (mock). Proceed to confirmation.",
    });
  } catch (e) {
    // 5) Catch global — on renvoie une erreur serveur claire
    return res.status(500).json({
      error: "Checkout init failed",
      detail: String(e),
    });
  }
}
