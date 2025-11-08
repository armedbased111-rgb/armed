// apps/api/scripts/setWaveform.ts
// Run: tsx scripts/setWaveform.ts kit-808-foundation ./waveforms/kit-808-foundation.json
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { prisma } from "../src/prismaClient";

async function main() {
  const slug = process.argv[2];
  const waveformPath = process.argv[3];
  if (!slug || !waveformPath) {
    console.error("Usage: tsx scripts/setWaveform.ts <slug> <waveform.json>");
    process.exit(1);
  }

  const samples = JSON.parse(readFileSync(resolve(waveformPath), "utf8"));
  if (!Array.isArray(samples) || samples.length === 0) {
    console.error("Invalid waveform data");
    process.exit(1);
  }
  const normalized = samples.map((v: unknown) => {
    const num = Number(v);
    return Math.max(0, Math.min(Number.isFinite(num) ? num : 0, 1));
  });

  const product = await prisma.product.findUnique({ where: { slug }, select: { id: true, title: true } });
  if (!product) {
    console.error(`Product not found: ${slug}`);
    process.exit(1);
  }

  await prisma.product.update({
    where: { slug },
    data: { waveformData: normalized },
  });

  console.log(`Waveform set for "${product.title}" (${slug}) with ${normalized.length} samples.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
