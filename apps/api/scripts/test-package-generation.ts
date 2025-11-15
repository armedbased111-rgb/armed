// apps/api/scripts/test-package-generation.ts
/**
 * Script de test pour la génération de packages personnalisés (S20)
 * 
 * Usage:
 *   npx tsx scripts/test-package-generation.ts [orderId]
 * 
 * Si orderId n'est pas fourni, le script créera une commande de test
 */

import { PrismaClient } from "@prisma/client";
import { getOrCreateDownloadPackage, validatePackageDownload } from "../src/services/packageGenerator";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

async function createTestOrder() {
  console.log("📝 Création d'une commande de test...");

  // Récupérer un produit existant
  const product = await prisma.product.findFirst({
    where: {
      fileUrl: {
        not: null,
      },
    },
  });

  if (!product) {
    throw new Error("Aucun produit avec fileUrl trouvé. Ajoutez un produit d'abord.");
  }

  console.log(`   Produit trouvé: ${product.title}`);

  // Créer une commande
  const order = await prisma.order.create({
    data: {
      buyerEmail: `test-${Date.now()}@example.com`,
      totalCents: product.priceCents,
      currency: "EUR",
      status: "PAID",
      items: {
        create: [
          {
            productId: product.id,
            priceCents: product.priceCents,
            currency: "EUR",
            licenseType: "STANDARD",
          },
        ],
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  console.log(`   ✅ Commande créée: ${order.id}`);
  console.log(`   Email: ${order.buyerEmail}`);
  console.log(`   Total: ${(order.totalCents / 100).toFixed(2)} EUR`);
  console.log(`   Produits: ${order.items.length}`);

  return order.id;
}

async function testPackageGeneration(orderId: string) {
  console.log("\n🔨 Test de génération de package...");
  console.log(`   Order ID: ${orderId}`);

  try {
    // Vérifier que la commande existe
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
      throw new Error(`Commande ${orderId} introuvable`);
    }

    console.log(`   Commande: ${order.buyerEmail}`);
    console.log(`   Statut: ${order.status}`);
    console.log(`   Items: ${order.items.length}`);

    // Générer le package
    console.log("\n📦 Génération du package...");
    const packageInfo = await getOrCreateDownloadPackage(orderId);

    console.log(`   ✅ Package généré avec succès!`);
    console.log(`   Package ID: ${packageInfo.packageId}`);
    console.log(`   Hash: ${packageInfo.zipHash}`);
    console.log(`   Taille: ${packageInfo.fileSizeMb.toFixed(2)} MB`);
    console.log(`   Expire le: ${packageInfo.expiresAt.toLocaleString("fr-FR")}`);
    console.log(`   ZIP URL: ${packageInfo.zipUrl}`);

    // Vérifier que le fichier existe
    const zipPath = path.join(
      process.cwd(),
      "..",
      "web",
      packageInfo.zipUrl.replace("./public", "public")
    );

    if (fs.existsSync(zipPath)) {
      const stats = fs.statSync(zipPath);
      console.log(`   ✅ Fichier ZIP existe (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
    } else {
      console.log(`   ❌ Fichier ZIP introuvable: ${zipPath}`);
    }

    return packageInfo;
  } catch (error) {
    console.error("   ❌ Erreur:", (error as Error).message);
    throw error;
  }
}

async function testPackageValidation(orderId: string) {
  console.log("\n🔍 Test de validation du package...");

  try {
    const validation = await validatePackageDownload(orderId);

    if (validation.valid) {
      const pkg = validation.package;
      console.log(`   ✅ Package valide`);
      console.log(`   Téléchargements: ${pkg.downloadCount}/${pkg.maxDownloads}`);
      console.log(`   Restants: ${pkg.maxDownloads - pkg.downloadCount}`);
      console.log(`   Expiré: ${new Date() > pkg.expiresAt ? "Oui" : "Non"}`);
    } else {
      console.log(`   ❌ Package invalide: ${validation.error}`);
    }

    return validation;
  } catch (error) {
    console.error("   ❌ Erreur:", (error as Error).message);
    throw error;
  }
}

async function testPackageInfo(orderId: string) {
  console.log("\n📋 Informations du package dans la DB...");

  const pkg = await prisma.downloadPackage.findUnique({
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

  if (!pkg) {
    console.log("   ❌ Aucun package trouvé dans la DB");
    return null;
  }

  console.log(`   ID: ${pkg.id}`);
  console.log(`   Hash: ${pkg.zipHash}`);
  console.log(`   Généré le: ${pkg.generatedAt.toLocaleString("fr-FR")}`);
  console.log(`   Expire le: ${pkg.expiresAt.toLocaleString("fr-FR")}`);
  console.log(`   Taille: ${pkg.fileSizeMb || "N/A"} MB`);
  console.log(`   Téléchargements: ${pkg.downloadCount}/${pkg.maxDownloads}`);
  console.log(`   Dernier téléchargement: ${pkg.lastDownloadAt?.toLocaleString("fr-FR") || "Jamais"}`);
  console.log(`   Commande: ${pkg.order.buyerEmail}`);
  console.log(`   Produits:`);
  pkg.order.items.forEach((item, i) => {
    console.log(`     ${i + 1}. ${item.product.title} (${item.licenseType})`);
  });

  return pkg;
}

async function listAllPackages() {
  console.log("\n📊 Liste de tous les packages:");

  const packages = await prisma.downloadPackage.findMany({
    include: {
      order: true,
    },
    orderBy: {
      generatedAt: "desc",
    },
    take: 10,
  });

  if (packages.length === 0) {
    console.log("   Aucun package trouvé");
    return;
  }

  console.log(`   ${packages.length} package(s) trouvé(s):\n`);

  packages.forEach((pkg, i) => {
    const isExpired = new Date() > pkg.expiresAt;
    const remaining = pkg.maxDownloads - pkg.downloadCount;
    const status = isExpired
      ? "⏰ Expiré"
      : remaining === 0
      ? "🚫 Épuisé"
      : remaining === pkg.maxDownloads
      ? "✨ Neuf"
      : "📥 Utilisé";

    console.log(`   ${i + 1}. ${status}`);
    console.log(`      Order: ${pkg.orderId.substring(0, 8)}...`);
    console.log(`      Email: ${pkg.order.buyerEmail}`);
    console.log(`      Téléchargements: ${pkg.downloadCount}/${pkg.maxDownloads}`);
    console.log(`      Généré: ${pkg.generatedAt.toLocaleDateString("fr-FR")}`);
    console.log();
  });
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    console.log("═══════════════════════════════════════════════════");
    console.log("  TEST DE GÉNÉRATION DE PACKAGES (S20)");
    console.log("═══════════════════════════════════════════════════\n");

    if (command === "list") {
      // Lister tous les packages
      await listAllPackages();
    } else {
      let orderId = command;

      // Si pas d'orderId fourni, créer une commande de test
      if (!orderId) {
        orderId = await createTestOrder();
      }

      // Tester la génération
      await testPackageGeneration(orderId);

      // Tester la validation
      await testPackageValidation(orderId);

      // Afficher les infos complètes
      await testPackageInfo(orderId);

      console.log("\n═══════════════════════════════════════════════════");
      console.log("  ✅ TESTS TERMINÉS AVEC SUCCÈS");
      console.log("═══════════════════════════════════════════════════");
      console.log("\n📝 Prochaines étapes:");
      console.log(`   1. Télécharger le package:`);
      console.log(`      http://localhost:3000/api/orders/${orderId}/package/download`);
      console.log(`   2. Vérifier le contenu du ZIP`);
      console.log(`   3. Ouvrir le PDF de licence`);
      console.log(`   4. Vérifier le fichier .package_info.json\n`);
    }
  } catch (error) {
    console.error("\n❌ Erreur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

