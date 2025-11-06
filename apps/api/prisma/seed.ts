import { prisma } from "../src/prismaClient";

async function main() {
  await prisma.product.createMany({
    data: [
      { sku: "TEE-BLK-001", name: "Tee Noir", priceCents: 3900, currency: "EUR", stock: 25 },
      { sku: "HOOD-GRY-002", name: "Hoodie Gris", priceCents: 7900, currency: "EUR", stock: 10 }
    ],
    skipDuplicates: true
  });
  console.log("Seed ok");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
