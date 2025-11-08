// apps/api/scripts/setPreviewUrl.ts
import { prisma } from "../src/prismaClient";

async function main() {
  await prisma.product.update({
    where: { slug: "kit-808-foundation" }, // a changer
    data: { previewUrl: "http://localhost:5174/previews/kit-808-foundation.mp3" }, // a changer
  });
  console.log("Preview URL set.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
