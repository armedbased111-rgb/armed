import type { Request, Response } from "express";
import { prisma } from "../prismaClient";

// Petit util de parsing/validation “comme on typerait des props”
function parseQuery(req: Request) {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 12);
  const sort = String(req.query.sort ?? "createdAt"); // "createdAt" | "price"
  const order = String(req.query.order ?? "desc");    // "asc" | "desc"

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize >= 1 && pageSize <= 100 ? pageSize : 12;
  const safeSort = sort === "price" ? "priceCents" : "createdAt";
  const safeOrder = order === "asc" ? "asc" : "desc";

  return { page: safePage, pageSize: safePageSize, sort: safeSort as "createdAt" | "priceCents", order: safeOrder as "asc" | "desc" };
}

// GET /products
export async function getProducts(req: Request, res: Response) {
  try {
    const { page, pageSize, sort, order } = parseQuery(req);

    // “Derived state” pour la pagination
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // On calcule le total pour exposer une meta utile au front (comme des props dérivées)
    const total = await prisma.product.count();

    const items = await prisma.product.findMany({
      skip,
      take,
      orderBy: { [sort]: order },
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
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    res.json({
      data: items,
      meta: {
        page,
        pageSize,
        total,
        totalPages,
        sort: sort === "priceCents" ? "price" : "createdAt",
        order,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch products", detail: String(e) });
  }
}
