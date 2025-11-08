// apps/api/src/routes/productDetail.ts
import type { Request, Response } from "express";
import { prisma } from "../prismaClient";

// GET /products/:slug — renvoie aussi assets audio + licences
export async function getProductBySlug(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);
    if (!slug) return res.status(400).json({ error: "Missing slug" });

    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        priceCents: true,
        currency: true,
        tags: true,
        bpm: true,
        key: true,
        description: true,
        coverUrl: true,
        previewUrl: true,
        durationSec: true,
        waveformData: true,
        createdAt: true,
        updatedAt: true,
        licenses: {
          select: { type: true, priceCents: true, currency: true },
        },
      },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch product", detail: String(e) });
  }
}
