// apps/api/src/services/packageGenerator.ts
import archiver from "archiver";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "../prismaClient";
import { generateOrderLicensePDF } from "./license";
import { Readable } from "stream";

const DOWNLOAD_EXPIRATION_HOURS = parseInt(process.env.DOWNLOAD_EXPIRATION_HOURS || "48");
const MAX_PACKAGE_DOWNLOADS = parseInt(process.env.MAX_PACKAGE_DOWNLOADS || "3");

export interface PackageGenerationResult {
  packageId: string;
  zipUrl: string;
  zipHash: string;
  licenseUrl: string;
  fileSizeMb: number;
  expiresAt: Date;
}

/**
 * Génère un hash unique pour tracer le package
 */
function generatePackageHash(orderId: string, buyerEmail: string): string {
  const timestamp = new Date().toISOString();
  const data = `${orderId}-${buyerEmail}-${timestamp}-${Math.random()}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Génère un package ZIP complet pour une commande
 * Contient : fichiers audio + PDF de licence + fichier hash invisible
 */
export async function generateDownloadPackage(orderId: string): Promise<PackageGenerationResult> {
  // Récupérer la commande avec tous ses items et produits
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
    throw new Error("Order must be paid to generate download package");
  }

  // Vérifier si un package existe déjà
  const existingPackage = await prisma.downloadPackage.findUnique({
    where: { orderId },
  });

  if (existingPackage && existingPackage.zipUrl) {
    // Si le package existe et n'a pas expiré, le retourner
    if (new Date() < existingPackage.expiresAt) {
      return {
        packageId: existingPackage.id,
        zipUrl: existingPackage.zipUrl,
        zipHash: existingPackage.zipHash,
        licenseUrl: existingPackage.licenseUrl || "",
        fileSizeMb: existingPackage.fileSizeMb || 0,
        expiresAt: existingPackage.expiresAt,
      };
    }
  }

  // Générer le hash unique
  const packageHash = generatePackageHash(orderId, order.buyerEmail);

  // Créer le dossier temporaire pour le package
  const tempDir = path.join(process.cwd(), "temp", orderId);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    // 1. Générer le PDF de licence
    const licensePDF = await generateOrderLicensePDF({
      orderId: order.id,
      buyerEmail: order.buyerEmail,
      items: order.items.map((item) => ({
        productTitle: item.product.title,
        licenseType: item.licenseType,
      })),
      totalAmount: (order.totalCents / 100).toFixed(2),
      currency: order.currency,
      purchaseDate: order.createdAt,
    });

    // Sauvegarder le PDF temporairement
    const licensePath = path.join(tempDir, `license-${orderId}.pdf`);
    fs.writeFileSync(licensePath, licensePDF);

    // 2. Créer le fichier de hash invisible
    const hashData = {
      packageHash,
      orderId: order.id,
      buyerEmail: order.buyerEmail,
      generatedAt: new Date().toISOString(),
      items: order.items.map((item) => ({
        productId: item.productId,
        productTitle: item.product.title,
        licenseType: item.licenseType,
      })),
    };

    const hashPath = path.join(tempDir, ".package_info.json");
    fs.writeFileSync(hashPath, JSON.stringify(hashData, null, 2));

    // 3. Créer le ZIP
    const zipPath = path.join(tempDir, `reboul-${orderId}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    await new Promise<void>((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);
      archive.on("error", reject);

      archive.pipe(output);

      // Ajouter le PDF de licence
      archive.append(licensePDF, { name: `LICENSE-${orderId}.pdf` });

      // Ajouter le fichier de hash (invisible)
      archive.append(JSON.stringify(hashData, null, 2), {
        name: ".package_info.json",
      });

      // Ajouter tous les fichiers audio de la commande
      for (const item of order.items) {
        const product = item.product;
        
        if (!product.fileUrl) {
          console.warn(`⚠️ Product ${product.title} has no fileUrl, skipping`);
          continue;
        }

        // Si c'est un fichier local
        if (
          product.fileUrl.startsWith("./public") ||
          product.fileUrl.startsWith("/public")
        ) {
          const filePath = path.join(
            process.cwd(),
            "..",
            "web",
            product.fileUrl.replace("./public", "public")
          );

          if (fs.existsSync(filePath)) {
            const fileName = path.basename(filePath);
            const sanitizedFileName = `${sanitizeFilename(product.title)}-${fileName}`;
            archive.file(filePath, { name: sanitizedFileName });
          } else {
            console.warn(`⚠️ File not found: ${filePath}`);
          }
        }
        // Si c'est une URL S3, on pourrait la télécharger ici
        // Pour l'instant on skip les URLs externes
      }

      // Finaliser le ZIP
      archive.finalize();
    });

    // 4. Calculer la taille du fichier
    const stats = fs.statSync(zipPath);
    const fileSizeMb = stats.size / (1024 * 1024);

    // 5. Déplacer le ZIP vers le dossier de stockage permanent
    const storageDir = path.join(process.cwd(), "..", "web", "public", "packages");
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const finalZipPath = path.join(storageDir, `reboul-${orderId}-${packageHash.substring(0, 8)}.zip`);
    fs.copyFileSync(zipPath, finalZipPath);

    // URL relative du fichier
    const zipUrl = `./public/packages/${path.basename(finalZipPath)}`;
    const licenseUrl = `./public/packages/license-${orderId}.pdf`;

    // Copier aussi le PDF de licence
    const finalLicensePath = path.join(storageDir, `license-${orderId}.pdf`);
    fs.copyFileSync(licensePath, finalLicensePath);

    // 6. Nettoyer le dossier temporaire
    fs.rmSync(tempDir, { recursive: true, force: true });

    // 7. Créer ou mettre à jour le package dans la DB
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + DOWNLOAD_EXPIRATION_HOURS);

    const downloadPackage = await prisma.downloadPackage.upsert({
      where: { orderId },
      create: {
        orderId,
        zipUrl,
        zipHash: packageHash,
        licenseUrl,
        fileSizeMb,
        expiresAt,
        maxDownloads: MAX_PACKAGE_DOWNLOADS,
      },
      update: {
        zipUrl,
        zipHash: packageHash,
        licenseUrl,
        fileSizeMb,
        expiresAt,
        generatedAt: new Date(),
      },
    });

    return {
      packageId: downloadPackage.id,
      zipUrl,
      zipHash: packageHash,
      licenseUrl,
      fileSizeMb,
      expiresAt,
    };
  } catch (error) {
    // Nettoyer en cas d'erreur
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    throw error;
  }
}

/**
 * Nettoie le nom de fichier pour éviter les caractères invalides
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9\-_]/gi, "-")
    .replace(/--+/g, "-")
    .toLowerCase();
}

/**
 * Récupère ou génère le package de téléchargement pour une commande
 */
export async function getOrCreateDownloadPackage(
  orderId: string
): Promise<PackageGenerationResult> {
  // Vérifier si un package existe déjà
  const existingPackage = await prisma.downloadPackage.findUnique({
    where: { orderId },
  });

  // Si le package existe et n'a pas expiré, le retourner
  if (existingPackage && existingPackage.zipUrl && new Date() < existingPackage.expiresAt) {
    return {
      packageId: existingPackage.id,
      zipUrl: existingPackage.zipUrl,
      zipHash: existingPackage.zipHash,
      licenseUrl: existingPackage.licenseUrl || "",
      fileSizeMb: existingPackage.fileSizeMb || 0,
      expiresAt: existingPackage.expiresAt,
    };
  }

  // Sinon, générer un nouveau package
  return await generateDownloadPackage(orderId);
}

/**
 * Enregistre un téléchargement de package
 */
export async function recordPackageDownload(packageId: string): Promise<void> {
  const pkg = await prisma.downloadPackage.findUnique({
    where: { id: packageId },
  });

  if (!pkg) {
    throw new Error("Package not found");
  }

  if (pkg.downloadCount >= pkg.maxDownloads) {
    throw new Error(`Download limit reached (${pkg.maxDownloads} downloads)`);
  }

  await prisma.downloadPackage.update({
    where: { id: packageId },
    data: {
      downloadCount: pkg.downloadCount + 1,
      lastDownloadAt: new Date(),
    },
  });
}

/**
 * Valide qu'un package peut être téléchargé
 */
export async function validatePackageDownload(
  orderId: string
): Promise<{ valid: boolean; error?: string; package?: any }> {
  const pkg = await prisma.downloadPackage.findUnique({
    where: { orderId },
    include: {
      order: true,
    },
  });

  if (!pkg) {
    return { valid: false, error: "Package not found" };
  }

  if (new Date() > pkg.expiresAt) {
    return { valid: false, error: "Package has expired" };
  }

  if (pkg.downloadCount >= pkg.maxDownloads) {
    return {
      valid: false,
      error: `Download limit reached (${pkg.maxDownloads} downloads)`,
    };
  }

  if (!pkg.zipUrl) {
    return { valid: false, error: "Package not yet generated" };
  }

  return { valid: true, package: pkg };
}

