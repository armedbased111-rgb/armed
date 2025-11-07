import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { prisma } from "./prismaClient";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});
// GET PRODUCTS
app.get("/products", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch products", detail: String(e) });
  }
});

// POST /orders/test — crée une commande simple avec le premier produit
app.post("/orders/test", async (_req: Request, res: Response) => {
  try {
    const product = await prisma.product.findFirst();
    if (!product) {
      return res.status(400).json({ error: "No product found. Seed products first." });
    }

    const order = await prisma.order.create({
      data: {
        buyerEmail: "buyer@example.com",
        currency: product.currency,
        status: "PENDING",
        totalCents: product.priceCents,
        items: {
          create: [
            {
              productId: product.id,
              priceCents: product.priceCents,
              currency: product.currency,
              licenseType: "STANDARD",
            },
          ],
        },
      },
      include: { items: true },
    });

    res.json(order);
  } catch (e) {
    res.status(500).json({ error: "Failed to create test order", detail: String(e) });
  }
});


const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
