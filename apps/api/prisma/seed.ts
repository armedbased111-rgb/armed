import { PrismaClient, ProductType, LicenseType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Nettoyer les données existantes (optionnel)
  console.log("🧹 Cleaning existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.productLicense.deleteMany();
  await prisma.product.deleteMany();

  // Créer des Soundkits
  console.log("📦 Creating soundkits...");
  const soundkit1 = await prisma.product.create({
    data: {
      slug: "kit-808-foundation",
      title: "808 Foundation",
      priceCents: 3999,
      currency: "EUR",
      tags: ["808", "Trap", "Drill"],
      bpm: 140,
      key: "Am",
      description: "Collection complète de 808s pour vos productions trap et drill",
      coverUrl: "/covers/808-foundation.jpg",
      previewUrl: "/previews/kit-808-foundation.mp3",
      productType: "SOUNDKIT",
      licenses: {
        create: [
          {
            type: "STANDARD",
            priceCents: 3999,
            currency: "EUR",
          },
          {
            type: "EXTENDED",
            priceCents: 5999,
            currency: "EUR",
          },
        ],
      },
    },
  });

  const soundkit2 = await prisma.product.create({
    data: {
      slug: "halo-soundkit",
      title: "HALO Soundkit",
      priceCents: 9999,
      currency: "EUR",
      tags: ["Premium", "Trap", "R&B"],
      bpm: 130,
      key: "C",
      description: "Kit premium avec samples de qualité studio",
      coverUrl: "/covers/halo.jpg",
      previewUrl: "/previews/halo.mp3",
      productType: "SOUNDKIT",
      licenses: {
        create: [
          {
            type: "STANDARD",
            priceCents: 9999,
            currency: "EUR",
          },
          {
            type: "EXTENDED",
            priceCents: 14999,
            currency: "EUR",
          },
        ],
      },
    },
  });

  console.log("✅ Created soundkits:", soundkit1.slug, soundkit2.slug);

  // Créer des Beats/Tracks
  console.log("🎵 Creating beats...");
  
  const beats = [
    {
      slug: "trap-beat-001",
      title: "Dark Trap",
      priceCents: 5000,
      genre: "Trap",
      bpm: 140,
      key: "Am",
      description: "Beat trap sombre avec des 808s puissantes",
    },
    {
      slug: "drill-beat-001",
      title: "UK Drill Vibe",
      priceCents: 5000,
      genre: "Drill",
      bpm: 145,
      key: "F#m",
      description: "Beat drill authentique style UK",
    },
    {
      slug: "rnb-beat-001",
      title: "Smooth R&B",
      priceCents: 5000,
      genre: "R&B",
      bpm: 90,
      key: "Cm",
      description: "Beat R&B smooth avec des mélodies douces",
    },
    {
      slug: "afrobeat-001",
      title: "Afrobeat Energy",
      priceCents: 5000,
      genre: "Afrobeat",
      bpm: 120,
      key: "G",
      description: "Beat afrobeat énergique avec des percussions authentiques",
    },
    {
      slug: "jersey-beat-001",
      title: "Jersey Club",
      priceCents: 5000,
      genre: "Jersey",
      bpm: 130,
      key: "Dm",
      description: "Beat Jersey Club avec des breaks caractéristiques",
    },
    {
      slug: "trap-beat-002",
      title: "Hard Trap",
      priceCents: 5000,
      genre: "Trap",
      bpm: 150,
      key: "Bm",
      description: "Beat trap hardcore pour les bangers",
    },
    {
      slug: "drill-beat-002",
      title: "NY Drill",
      priceCents: 5000,
      genre: "Drill",
      bpm: 140,
      key: "Em",
      description: "Beat drill style New York",
    },
    {
      slug: "phonk-beat-001",
      title: "Phonk Wave",
      priceCents: 5000,
      genre: "Phonk",
      bpm: 160,
      key: "Am",
      description: "Beat phonk avec des samples vintage",
    },
  ];

  for (const beat of beats) {
    await prisma.product.create({
      data: {
        slug: beat.slug,
        title: beat.title,
        priceCents: beat.priceCents,
        currency: "EUR",
        tags: [beat.genre],
        genre: beat.genre,
        bpm: beat.bpm,
        key: beat.key,
        description: beat.description,
        coverUrl: `/covers/${beat.slug}.jpg`,
        previewUrl: `/previews/${beat.slug}.mp3`,
        productType: "BEAT",
        licenses: {
          create: [
            {
              type: "MP3",
              priceCents: 3000,
              currency: "EUR",
            },
            {
              type: "WAV",
              priceCents: 5000,
              currency: "EUR",
            },
            {
              type: "EXCLUSIVE",
              priceCents: 15000,
              currency: "EUR",
            },
          ],
        },
      },
    });
  }

  console.log(`✅ Created ${beats.length} beats`);

  // Afficher un résumé
  const totalProducts = await prisma.product.count();
  const totalBeats = await prisma.product.count({ where: { productType: "BEAT" } });
  const totalSoundkits = await prisma.product.count({ where: { productType: "SOUNDKIT" } });
  const totalLicenses = await prisma.productLicense.count();

  console.log("\n📊 Database summary:");
  console.log(`   Total products: ${totalProducts}`);
  console.log(`   Beats: ${totalBeats}`);
  console.log(`   Soundkits: ${totalSoundkits}`);
  console.log(`   Licenses: ${totalLicenses}`);
  console.log("\n✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
