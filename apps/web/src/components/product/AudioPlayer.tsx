// apps/web/src/components/product/AudioPlayer.tsx
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import WaveformCanvas from "./WaveformCanvas";

/*
  AudioPlayer responsive:
  - Le container prend 100% de la largeur (via w-full)
  - Les contrôles s’adaptent (stack en mobile, alignés en desktop via classes)
  - La waveform occupe la largeur disponible, hauteur fixe raisonnable (64px)
  - Aucun element avec width fixe > container
*/
function formatTime(sec: number) {
  if (!sec || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({
  src,
  waveformData,
}: {
  src?: string | null;
  waveformData?: number[] | null;
}) {
  // Hook audio toujours appelé (même si src est undefined)
  const {
    isReady,
    isPlaying,
    currentTime,
    duration,
    volume,
    loop,
    error,
    play,
    pause,
    seek,
    setVolume,
    toggleLoop,
  } = useAudioPlayer(src || undefined);

  // Fallback visuel si pas de src
  if (!src) {
    return (
      <div className="w-full rounded-lg border border-neutral-700 p-4">
        <p className="text-sm text-neutral-400">Aucune preview disponible.</p>
      </div>
    );
  }

  const progress = duration ? currentTime / duration : 0;

  return (
    <div className="w-full rounded-lg border border-neutral-700 p-4">
      {/* Contrôles: mobile-first (pile), sm+: inline */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 mb-3">
        <button
          className="h-10 px-4 rounded bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 w-full sm:w-auto"
          onClick={isPlaying ? pause : play}
          disabled={!isReady || !!error}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          className={`h-10 px-4 rounded border border-neutral-700 w-full sm:w-auto ${
            loop ? "bg-neutral-700 text-white" : "bg-neutral-900 text-neutral-200"
          }`}
          onClick={toggleLoop}
          aria-pressed={loop}
        >
          Loop {loop ? "On" : "Off"}
        </button>

        {/* Volume slider: prend la place en sm+, stack en mobile */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-sm text-neutral-400">Volume</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 sm:flex-none"
          />
        </div>
      </div>

      {/* Waveform responsive */}
      {waveformData && waveformData.length > 0 ? (
        <WaveformCanvas
          samples={waveformData}
          progress={progress}
          height={64} // hauteur raisonnable en mobile
          onSeek={(ratio) => duration && seek(ratio * duration)}
        />
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-400 w-12">{formatTime(currentTime)}</span>
          <div className="flex-1 h-3 rounded bg-neutral-800 overflow-hidden border border-neutral-700">
            <div
              className="h-full bg-violet-600 transition-[width] duration-100"
              style={{ width: `${Math.max(0, Math.min(progress * 100, 100))}%` }}
            />
          </div>
          <span className="text-sm text-neutral-400 w-12 text-right">{formatTime(duration)}</span>
        </div>
      )}

      {/* Seek slider */}
      <div className="mt-3">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.5}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full"
          aria-label="Seek"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">Audio error: {error}</p>
      )}
    </div>
  );
}
