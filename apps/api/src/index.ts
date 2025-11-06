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

app.get("/products", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch products", detail: String(e) });
  }
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
