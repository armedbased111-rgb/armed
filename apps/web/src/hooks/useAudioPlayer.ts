import { useEffect, useRef, useState } from "react";

export function useAudioPlayer(src?: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loop, setLoop] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialisation de l’élément audio
  useEffect(() => {
    if (!src) {
      setError("Aucune preview disponible");
      setIsReady(false);
      return;
    }
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.preload = "metadata"; // charge juste les métadonnées (durée) au départ
    audio.loop = loop;
    audio.volume = volume;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsReady(true);
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onEnded = () => setIsPlaying(false);
    const onError = () => setError("Erreur de lecture audio");

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
    // note: ne met pas loop/volume en deps ici pour éviter de recréer l’audio à chaque change
  }, [src]);

  // APIs de contrôle
  const play = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      setError("Lecture impossible (autoplay bloqué ou ressource inaccessible)");
    }
  };

  const pause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  };

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(0, time), duration || 0);
  };

  const setVolumeSafe = (v: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.min(Math.max(v, 0), 1);
    audio.volume = clamped;
    setVolume(clamped);
  };

  const toggleLoop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = !audio.loop;
    setLoop(audio.loop);
  };

  return {
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
    setVolume: setVolumeSafe,
    toggleLoop,
  };
}
