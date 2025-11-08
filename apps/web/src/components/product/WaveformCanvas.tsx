// apps/web/src/components/product/WaveformCanvas.tsx
import { useEffect, useRef } from "react";

export default function WaveformCanvas({
  samples,
  width = 800,
  height = 80,
  progress = 0,
  onSeek,
  color = "#7C3AED",
  bgColor = "#11161B",
  cursorColor = "#E5E7EB",
}: {
  samples: number[];
  width?: number;
  height?: number;
  progress?: number;
  onSeek?: (ratio: number) => void;
  color?: string;
  bgColor?: string;
  cursorColor?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const paddingX = 8, paddingY = 6;
    const usableW = Math.max(1, width - paddingX * 2);
    const usableH = Math.max(1, height - paddingY * 2);

    const barStride = 2;
    const barCount = Math.min(samples.length, Math.floor(usableW / barStride));
    const sampleStep = samples.length / barCount;

    ctx.fillStyle = color;
    for (let i = 0; i < barCount; i++) {
      const sampleIdx = Math.floor(i * sampleStep);
      const v = Math.max(0, Math.min(samples[sampleIdx] ?? 0, 1));
      const barH = Math.max(1, Math.floor(v * usableH));
      const x = paddingX + i * barStride;
      const y = Math.floor((height - barH) / 2);
      ctx.fillRect(x, y, 1, barH);
    }

    const clamped = Math.max(0, Math.min(progress, 1));
    const cursorX = Math.floor(clamped * width);
    ctx.strokeStyle = cursorColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cursorX + 0.5, 0);
    ctx.lineTo(cursorX + 0.5, height);
    ctx.stroke();
  }, [samples, width, height, progress, color, bgColor, cursorColor]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
    onSeek(ratio);
  };

  return <canvas ref={canvasRef} onClick={handleClick} className="block rounded border border-neutral-700" aria-label="Waveform preview (click to seek)" />;
}
