// apps/api/src/routes/downloads.ts
import { Router, Request, Response } from "express";
import {
  generateDownloadLinksForOrder,
  validateDownloadToken,
  recordDownload,
  getDownloadStats,
} from "../services/downloads";
import { prisma } from "../prismaClient";
import path from "path";
import fs from "fs";

export const downloadsRouter = Router();

/**
 * GET /api/orders/:orderId/downloads (via proxy devient /orders/:orderId/downloads)
 * Récupère les liens de téléchargement pour une commande
 */
downloadsRouter.get("/orders/:orderId/downloads", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const downloadLinks = await generateDownloadLinksForOrder(orderId);
    res.json(downloadLinks);
  } catch (error) {
    console.error("Error generating download links:", error);
    res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/downloads/:token (via proxy devient /downloads/:token)
 * Télécharge un fichier avec un token sécurisé
 */
downloadsRouter.get("/downloads/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Obtenir l'IP du client
    const clientIp = 
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    // Valider le token
    const validation = await validateDownloadToken(token, clientIp);

    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }

    const { download, product } = validation;

    if (!product?.fileUrl) {
      return res.status(404).json({ error: "File not found" });
    }

    // Enregistrer le téléchargement
    await recordDownload(download!.id, clientIp);

    // Déterminer le chemin du fichier
    // Si fileUrl est un chemin local (commence par ./public ou /public)
    if (product.fileUrl.startsWith("./public") || product.fileUrl.startsWith("/public")) {
      const filePath = path.join(
        __dirname,
        "../../..",
        "web",
        product.fileUrl.replace("./public", "public")
      );

      // Vérifier que le fichier existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found on server" });
      }

      // Définir les headers pour le téléchargement
      const fileName = path.basename(filePath);
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.setHeader("Content-Type", "application/octet-stream");

      // Streamer le fichier
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } 
    // Si fileUrl est une URL S3 ou externe
    else if (product.fileUrl.startsWith("http://") || product.fileUrl.startsWith("https://")) {
      // Rediriger vers l'URL signée
      res.redirect(product.fileUrl);
    } 
    else {
      return res.status(400).json({ error: "Invalid file URL format" });
    }
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Download failed" });
  }
});

/**
 * GET /api/orders/:orderId/download-stats (via proxy devient /orders/:orderId/download-stats)
 * Récupère les statistiques de téléchargement pour une commande
 */
downloadsRouter.get("/orders/:orderId/download-stats", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const stats = await getDownloadStats(orderId);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching download stats:", error);
    res.status(500).json({ error: "Failed to fetch download stats" });
  }
});

/**
 * GET /api/orders/by-payment-intent/:piId (via proxy devient /orders/by-payment-intent/:piId)
 * Récupère l'orderId à partir d'un PaymentIntent Stripe
 */
downloadsRouter.get("/orders/by-payment-intent/:piId", async (req: Request, res: Response) => {
  try {
    const { piId } = req.params;
    
    // Chercher l'order qui correspond à ce PaymentIntent
    const order = await prisma.order.findUnique({
      where: { paymentIntentId: piId },
      select: { 
        id: true, 
        buyerEmail: true, 
        totalCents: true, 
        currency: true,
        status: true,
        createdAt: true
      },
    });
    
    if (!order) {
      return res.status(404).json({ 
        error: "Order not found yet. Webhook may still be processing." 
      });
    }
    
    res.json({ orderId: order.id, order });
  } catch (error) {
    console.error("Error finding order by payment intent:", error);
    res.status(500).json({ error: "Failed to find order" });
  }
});

/**
 * POST /api/downloads/validate (via proxy devient /downloads/validate)
 * Valide un token sans télécharger (pour vérifier avant)
 */
downloadsRouter.post("/downloads/validate", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const clientIp = 
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    const validation = await validateDownloadToken(token, clientIp);

    if (!validation.valid) {
      return res.status(403).json({ 
        valid: false, 
        error: validation.error 
      });
    }

    const { download, product } = validation;

    res.json({
      valid: true,
      product: {
        id: product!.id,
        title: product!.title,
        slug: product!.slug,
        fileSizeMb: product!.fileSizeMb,
      },
      download: {
        expiresAt: download!.expiresAt,
        downloadCount: download!.downloadCount,
        maxDownloads: download!.maxDownloads,
        remainingDownloads: download!.maxDownloads - download!.downloadCount,
      },
    });
  } catch (error) {
    console.error("Error validating token:", error);
    res.status(500).json({ error: "Validation failed" });
  }
});


