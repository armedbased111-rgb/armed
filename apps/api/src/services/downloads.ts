// apps/api/src/services/downloads.ts
import { prisma } from "../prismaClient";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const DOWNLOAD_EXPIRATION_HOURS = parseInt(process.env.DOWNLOAD_EXPIRATION_HOURS || "48");
const MAX_DOWNLOADS = parseInt(process.env.MAX_DOWNLOADS || "3");

export interface DownloadToken {
  downloadId: string;
  orderId: string;
  orderItemId: string;
  productId: string;
}

/**
 * Génère des liens de téléchargement sécurisés pour tous les items d'une commande
 */
export async function generateDownloadLinksForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "PAID") {
    throw new Error("Order must be paid to generate download links");
  }

  const downloadLinks = [];

  for (const item of order.items) {
    // Vérifier si un download existe déjà pour cet item
    let download = await prisma.download.findFirst({
      where: {
        orderId: order.id,
        orderItemId: item.id,
      },
    });

    // Si aucun download n'existe, en créer un
    if (!download) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + DOWNLOAD_EXPIRATION_HOURS);

      download = await prisma.download.create({
        data: {
          orderId: order.id,
          orderItemId: item.id,
          token,
          expiresAt,
          maxDownloads: MAX_DOWNLOADS,
        },
      });
    }

    // Générer un JWT signé pour sécuriser le lien
    const payload: DownloadToken = {
      downloadId: download.id,
      orderId: order.id,
      orderItemId: item.id,
      productId: item.productId,
    };

    const signedToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: `${DOWNLOAD_EXPIRATION_HOURS}h`,
    });

    downloadLinks.push({
      productId: item.productId,
      productTitle: item.product.title,
      productSlug: item.product.slug,
      downloadToken: signedToken,
      downloadUrl: `/downloads/${signedToken}`, // Le frontend ajoutera /api/ qui sera transformé par le proxy
      expiresAt: download.expiresAt,
      downloadsRemaining: download.maxDownloads - download.downloadCount,
      downloadCount: download.downloadCount,
      maxDownloads: download.maxDownloads,
    });
  }

  return {
    orderId: order.id,
    buyerEmail: order.buyerEmail,
    downloads: downloadLinks,
  };
}

/**
 * Valide un token de téléchargement et retourne les informations
 */
export async function validateDownloadToken(token: string, clientIp: string) {
  try {
    // Vérifier la signature JWT
    const decoded = jwt.verify(token, JWT_SECRET) as DownloadToken;

    // Récupérer le download depuis la base
    const download = await prisma.download.findUnique({
      where: { id: decoded.downloadId },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!download) {
      return { valid: false, error: "Download not found" };
    }

    // Vérifier l'expiration
    if (new Date() > download.expiresAt) {
      return { valid: false, error: "Download link has expired" };
    }

    // Vérifier le nombre de téléchargements
    if (download.downloadCount >= download.maxDownloads) {
      return {
        valid: false,
        error: `Download limit reached (${download.maxDownloads} downloads)`,
      };
    }

    // Trouver le product correspondant
    const orderItem = download.order.items.find(
      (item) => item.id === decoded.orderItemId
    );

    if (!orderItem || !orderItem.product) {
      return { valid: false, error: "Product not found" };
    }

    if (!orderItem.product.fileUrl) {
      return { valid: false, error: "Product file not available" };
    }

    return {
      valid: true,
      download,
      product: orderItem.product,
      orderItem,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: "Download token has expired" };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: "Invalid download token" };
    }
    return { valid: false, error: "Token validation failed" };
  }
}

/**
 * Enregistre un téléchargement (IP, date)
 */
export async function recordDownload(downloadId: string, clientIp: string) {
  const download = await prisma.download.findUnique({
    where: { id: downloadId },
  });

  if (!download) {
    throw new Error("Download not found");
  }

  // Ajouter l'IP et la date au tracking
  const updatedIps = [...download.ipAddresses, clientIp];
  const updatedDates = [...download.downloadDates, new Date()];

  await prisma.download.update({
    where: { id: downloadId },
    data: {
      downloadCount: download.downloadCount + 1,
      ipAddresses: updatedIps,
      downloadDates: updatedDates,
    },
  });

  return {
    downloadCount: download.downloadCount + 1,
    remainingDownloads: download.maxDownloads - (download.downloadCount + 1),
  };
}

/**
 * Obtient les statistiques de téléchargement pour une commande
 */
export async function getDownloadStats(orderId: string) {
  const downloads = await prisma.download.findMany({
    where: { orderId },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  return downloads.map((download) => {
    const orderItem = download.order.items.find(
      (item) => item.id === download.orderItemId
    );

    return {
      downloadId: download.id,
      productTitle: orderItem?.product.title || "Unknown",
      downloadCount: download.downloadCount,
      maxDownloads: download.maxDownloads,
      remainingDownloads: download.maxDownloads - download.downloadCount,
      expiresAt: download.expiresAt,
      isExpired: new Date() > download.expiresAt,
      ipAddresses: download.ipAddresses,
      downloadDates: download.downloadDates,
    };
  });
}


