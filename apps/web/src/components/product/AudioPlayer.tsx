// apps/web/src/components/product/AudioPlayer.tsx
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import WaveformCanvas from "./WaveformCanvas";

function formatTime(sec: number) {
  if (!sec || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ src, waveformData }: { src?: string | null; waveformData?: number[] | null }) {
  const { isReady, isPlaying, currentTime, duration, volume, loop, error, play, pause, seek, setVolume, toggleLoop } = useAudioPlayer(src || undefined);
  const progress = duration ? currentTime / duration : 0;

  return (
    <div className="rounded-lg border border-neutral-700 p-4">
      <div className="flex items-center gap-3 mb-3">
        <button className="h-10 px-4 rounded bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50" onClick={isPlaying ? pause : play} disabled={!isReady || !!error} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button className={`h-10 px-4 rounded ${loop ? "bg-neutral-700 text-white" : "bg-neutral-900 text-neutral-200"} border border-neutral-700`} onClick={toggleLoop} aria-pressed={loop} aria-label="Loop">
          Loop {loop ? "On" : "Off"}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-neutral-400">Volume</label>
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
        </div>
      </div>

      {waveformData && waveformData.length > 0 ? (
        <WaveformCanvas samples={waveformData} width={800} height={80} progress={progress} onSeek={(ratio) => duration && seek(ratio * duration)} />
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-400 w-12">{formatTime(currentTime)}</span>
          <div className="flex-1 h-3 rounded bg-neutral-800 overflow-hidden border border-neutral-700">
            <div className="h-full bg-violet-600 transition-[width] duration-100" style={{ width: `${Math.max(0, Math.min(progress * 100, 100))}%` }} />
          </div>
          <span className="text-sm text-neutral-400 w-12 text-right">{formatTime(duration)}</span>
        </div>
      )}

      <div className="mt-3">
        <input type="range" min={0} max={duration || 0} step={0.5} value={currentTime} onChange={(e) => seek(Number(e.target.value))} className="w-full" aria-label="Seek" />
      </div>

      {error && <p className="mt-2 text-sm text-red-500">Audio error: {error}</p>}
      {!src && <p className="mt-2 text-sm text-neutral-400">Aucune preview disponible.</p>}
    </div>
  );
}
