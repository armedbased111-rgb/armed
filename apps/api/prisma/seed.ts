import "dotenv/config";
import { prisma } from "../src/prismaClient";

async function main() {
  // Imagine ça comme un “setState initial” de ton slice Product
  await prisma.product.createMany({
    data: [
      {
        slug: "kit-808-foundation",
        title: "Kit 808 Foundation",
        priceCents: 4900,
        currency: "EUR",
        tags: ["808", "bass", "trap"],
        bpm: 140,
        key: "Fm",
        description: "Sélection d'808 profondes et contrôlées, prêtes pour le mix.",
      },
      {
        slug: "drum-kit-essential",
        title: "Drum Kit Essential",
        priceCents: 3900,
        currency: "EUR",
        tags: ["drums", "snare", "kick"],
        bpm: 130,
        key: null,
        description: "Kicks/Snares/Claps essentiels pour trap & hiphop.",
      },
      {
        slug: "melody-pack-sapphire",
        title: "Melody Pack Sapphire",
        priceCents: 5900,
        currency: "EUR",
        tags: ["melody", "loop", "rnb"],
        bpm: 120,
        key: "Am",
        description: "Boucles mélodiques haut de gamme, ambiance RnB/Trap.",
      },
      {
        slug: "beat-phare-vol1",
        title: "Beat Phare Vol.1",
        priceCents: 9900,
        currency: "EUR",
        tags: ["beat", "full", "mix-ready"],
        bpm: 145,
        key: "Gm",
        description: "Beat phare prêt à l'emploi, mix-ready, stems inclus.",
      },
      {
        slug: "percs-textures-pack",
        title: "Percs & Textures Pack",
        priceCents: 2900,
        currency: "EUR",
        tags: ["percs", "textures", "fx"],
        bpm: null,
        key: null,
        description: "Percussions et textures pour construire des grooves uniques.",
      },
    ],
    // Comme en React quand on re-render un set initial: on évite les doublons
    skipDuplicates: true,
  });

  console.log("Seed catalogue OK");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
