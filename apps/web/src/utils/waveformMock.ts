// apps/web/src/utils/waveformMock.ts
export function generateWaveformMock(length = 1024) {
  const samples: number[] = [];
  for (let i = 0; i < length; i++) {
    // Variation pseudo-musicale: somme de sinusoïdes + bruit léger
    const t = i / length;
    const v =
      0.5 +
      0.3 * Math.sin(2 * Math.PI * t * 3) + // 3 “pics”
      0.2 * Math.sin(2 * Math.PI * t * 11) + // détails
      0.05 * (Math.random() - 0.5); // bruit
    samples.push(Math.max(0, Math.min(v, 1)));
  }
  return samples;
}
