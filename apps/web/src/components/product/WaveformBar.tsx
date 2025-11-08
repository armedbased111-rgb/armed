type WaveformBarProps = {
  progress: number; // 0..1
};

export default function WaveformBar({ progress }: WaveformBarProps) {
  // Fallback léger à la place d’une vraie waveform: une barre de progression
  const pct = Math.max(0, Math.min(progress * 100, 100));
  return (
    <div className="h-3 rounded bg-neutral-800 overflow-hidden border border-neutral-700">
      <div
        className="h-full bg-violet-600 transition-[width] duration-100"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
