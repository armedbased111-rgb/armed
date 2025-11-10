// apps/api/src/index.ts
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { prisma } from "./prismaClient";
import { getProducts } from "./routes/products";
import { getProductBySlug } from "./routes/productDetails";
import { initCheckout } from "./routes/checkout";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/checkout/init", initCheckout);

// Health (comme un useEffect ping DB)
app.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// S13: endpoints produits
app.get("/products", getProducts);
app.get("/products/:slug", getProductBySlug);

// 404
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
