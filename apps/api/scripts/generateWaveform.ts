// apps/api/scripts/generateWaveform.ts
// Run: tsx scripts/generateWaveform.ts ../../apps/web/public/previews/kit-808-foundation.mp3 ./waveforms/kit-808-foundation.json
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

function analyzePCM(pcm: Buffer, sampleRate = 44100, targetSamples = 1024) {
  const sampleCount = pcm.length / 2; // 16-bit = 2 bytes
  const windowSize = Math.floor(sampleRate * 0.02); // ~20ms
  const rmsValues: number[] = [];

  for (let i = 0; i < sampleCount; i += windowSize) {
    let sumSquares = 0;
    const end = Math.min(i + windowSize, sampleCount);
    for (let j = i; j < end; j++) {
      const sample = pcm.readInt16LE(j * 2);
      const norm = sample / 32768; // -1..1
      sumSquares += norm * norm;
    }
    const n = end - i || 1;
    const rms = Math.sqrt(sumSquares / n); // 0..1
    rmsValues.push(rms);
  }

  const max = rmsValues.reduce((m, v) => (v > m ? v : m), 0.0001);
  const normalized = rmsValues.map((v) => Math.min(1, v / max));

  const out: number[] = [];
  for (let i = 0; i < targetSamples; i++) {
    const idx = Math.floor((i / targetSamples) * normalized.length);
    out.push(normalized[idx] ?? 0);
  }
  return out;
}

async function ffmpegToPCM(inputPath: string): Promise<Buffer> {
  return new Promise<Buffer>((resolveBuf, reject) => {
    const args = ["-i", inputPath, "-ac", "1", "-ar", "44100", "-f", "s16le", "pipe:1"];
    const ff = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });

    const chunks: Buffer[] = [];
    ff.stdout.on("data", (chunk) => chunks.push(chunk));
    ff.on("error", (err) => reject(err));
    ff.on("close", (code) => {
      if (code !== 0) return reject(new Error(`ffmpeg exited ${code}`));
      resolveBuf(Buffer.concat(chunks));
    });
  });
}

async function main() {
  const input = process.argv[2];
  const outPath = resolve(process.argv[3] || "./waveforms/waveform.json");
  if (!input) {
    console.error("Usage: tsx scripts/generateWaveform.ts /path/to/audio.mp3 [output.json]");
    process.exit(1);
  }
  try {
    const pcm = await ffmpegToPCM(input);
    const samples = analyzePCM(pcm);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(samples));
    console.log(`Waveform JSON written: ${outPath}`);
  } catch (e) {
    console.error("Failed to generate waveform:", e);
    process.exit(1);
  }
}

main();
