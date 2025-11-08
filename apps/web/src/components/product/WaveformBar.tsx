type WaveformBarProps = {
  progress: number; // 0..1
};

// apps/web/src/components/product/WaveformBar.tsx
export default function WaveformBar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(progress * 100, 100));
  return (
    <div className="h-3 rounded bg-neutral-800 overflow-hidden border border-neutral-700">
      <div className="h-full bg-violet-600 transition-[width] duration-100" style={{ width: `${pct}%` }} />
    </div>
  );
}
