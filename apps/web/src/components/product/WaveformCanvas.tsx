// apps/web/src/components/product/WaveformCanvas.tsx
import { useEffect, useRef } from "react";

/*
  WaveformCanvas responsive:
  - Le canvas s'adapte à la largeur du parent (via style width: 100%)
  - Hauteur fixe raisonnable (par défaut 64px), ajustable via props
  - HiDPI (retina) via devicePixelRatio
  - Aucun scroll horizontal: on dessine dans les bornes calculées
*/
export default function WaveformCanvas({
  samples,
  progress = 0,
  height = 64,
  barColor = "#7C3AED",     // violet
  bgColor = "#11161B",       // fond
  cursorColor = "#E5E7EB",   // curseur
  onSeek,
}: {
  samples: number[];
  progress?: number;              // 0..1
  height?: number;                // hauteur CSS (px)
  barColor?: string;
  bgColor?: string;
  cursorColor?: string;
  onSeek?: (ratio: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Récupère la largeur rendue (CSS) du parent
    const cssWidth = Math.max(1, canvas.parentElement?.clientWidth ?? window.innerWidth);
    const cssHeight = height;

    // HiDPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fond
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // Dessin des barres
    const paddingX = 8;
    const paddingY = 6;
    const usableW = Math.max(1, cssWidth - paddingX * 2);
    const usableH = Math.max(1, cssHeight - paddingY * 2);

    // Stride responsive: densité de barres selon largeur
    const barStride = Math.max(2, Math.floor(usableW / 512)); // évite trop dense en petit écran
    const barCount = Math.min(samples.length, Math.floor(usableW / barStride));
    const sampleStep = samples.length / barCount;

    ctx.fillStyle = barColor;
    for (let i = 0; i < barCount; i++) {
      const sampleIdx = Math.floor(i * sampleStep);
      const v = Math.max(0, Math.min(samples[sampleIdx] ?? 0, 1));
      const barH = Math.max(1, Math.floor(v * usableH));
      const x = paddingX + i * barStride;
      const y = Math.floor((cssHeight - barH) / 2);
      ctx.fillRect(x, y, 1, barH);
    }

    // Curseur de lecture
    const clamped = Math.max(0, Math.min(progress, 1));
    const cursorX = Math.floor(clamped * cssWidth);
    ctx.strokeStyle = cursorColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cursorX + 0.5, 0);
    ctx.lineTo(cursorX + 0.5, cssHeight);
    ctx.stroke();
  }, [samples, progress, height, barColor, bgColor, cursorColor]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
    onSeek(ratio);
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="block w-full rounded border border-neutral-700"
      aria-label="Waveform (tap/click to seek)"
    />
  );
}
