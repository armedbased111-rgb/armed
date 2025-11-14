// apps/api/scripts/add-product-files.ts
// Script pour ajouter les URLs de fichiers aux produits existants

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addProductFiles() {
  console.log("🔄 Mise à jour des URLs de fichiers pour les produits...\n");

  try {
    // Exemple: Ajouter un fichier au produit "kit-808-foundation"
    const product1 = await prisma.product.update({
      where: { slug: "kit-808-foundation" },
      data: {
        fileUrl: "./public/downloads/instinctzoran.m4a",
        fileSizeMb: 1.5,
      },
    });

    console.log(`✅ Produit mis à jour: ${product1.title}`);
    console.log(`   - File: ${product1.fileUrl}`);
    console.log(`   - Size: ${product1.fileSizeMb} MB\n`);

    // Ajouter d'autres produits ici
    // const product2 = await prisma.product.update({
    //   where: { slug: "autre-produit" },
    //   data: {
    //     fileUrl: "./public/downloads/autre-produit.zip",
    //     fileSizeMb: 180.0,
    //   },
    // });

    console.log("✅ Tous les produits ont été mis à jour !");
    
    // Afficher les produits sans fichier
    const productsWithoutFiles = await prisma.product.findMany({
      where: { fileUrl: null },
      select: { id: true, slug: true, title: true },
    });

    if (productsWithoutFiles.length > 0) {
      console.log("\n⚠️  Produits sans fichier:");
      productsWithoutFiles.forEach(p => {
        console.log(`   - ${p.title} (${p.slug})`);
      });
    } else {
      console.log("\n✅ Tous les produits ont un fichier associé !");
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
addProductFiles();

