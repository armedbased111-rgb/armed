// apps/api/src/routes/tracks.ts
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prismaClient";

const router = Router();

// Schéma de validation pour la query
const trackQuerySchema = z.object({
  page: z.string().optional().transform(v => parseInt(v || "1")),
  pageSize: z.string().optional().transform(v => parseInt(v || "10")),
  genre: z.string().optional(),
  minBpm: z.string().optional().transform(v => v ? parseInt(v) : undefined),
  maxBpm: z.string().optional().transform(v => v ? parseInt(v) : undefined),
  key: z.string().optional(),
  sort: z.enum(["createdAt", "price", "bpm"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * GET /tracks
 * Liste des beats disponibles avec filtres et pagination
 */
router.get("/", async (req, res) => {
  try {
    const query = trackQuerySchema.parse(req.query);
    const { page, pageSize, genre, minBpm, maxBpm, key, sort, order } = query;

    // Construire les filtres
    const where: any = {
      productType: "BEAT",
    };

    if (genre && genre !== "all") {
      where.genre = genre;
    }

    if (minBpm || maxBpm) {
      where.bpm = {};
      if (minBpm) where.bpm.gte = minBpm;
      if (maxBpm) where.bpm.lte = maxBpm;
    }

    if (key) {
      where.key = key;
    }

    // Compter le total
    const total = await prisma.product.count({ where });

    // Récupérer les produits avec pagination
    const tracks = await prisma.product.findMany({
      where,
      include: {
        licenses: true,
      },
      orderBy: {
        [sort]: order,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    res.json({
      data: tracks,
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching tracks:", error);
    res.status(400).json({
      error: "Invalid query parameters",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/tracks/:slug
 * Détail d'un beat par slug
 */
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const track = await prisma.product.findUnique({
      where: {
        slug,
        productType: "BEAT",
      },
      include: {
        licenses: true,
      },
    });

    if (!track) {
      return res.status(404).json({
        error: "Track not found",
        detail: `No track found with slug: ${slug}`,
      });
    }

    res.json(track);
  } catch (error) {
    console.error("Error fetching track:", error);
    res.status(500).json({
      error: "Internal server error",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/tracks/genres
 * Liste des genres disponibles
 */
router.get("/meta/genres", async (req, res) => {
  try {
    const genres = await prisma.product.findMany({
      where: {
        productType: "BEAT",
        genre: {
          not: null,
        },
      },
      select: {
        genre: true,
      },
      distinct: ["genre"],
    });

    const genreList = genres
      .map((g) => g.genre)
      .filter((g): g is string => g !== null)
      .sort();

    res.json({ genres: genreList });
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({
      error: "Internal server error",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;

