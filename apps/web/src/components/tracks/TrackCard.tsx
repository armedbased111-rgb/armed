import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useCart } from "../../store/cart";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

interface TrackCardProps {
  id: string;
  slug: string;
  title: string;
  producer?: string;
  bpm?: number;
  key?: string;
  genre?: string;
  audioPreviewUrl?: string;
  coverUrl?: string;
  mp3Price?: number;
  wavPrice?: number;
  exclusivePrice?: number;
}

export default function TrackCard({
  id,
  slug,
  title,
  producer = ".armed",
  bpm,
  key: trackKey,
  genre,
  audioPreviewUrl,
  coverUrl,
  mp3Price = 3000, // 30€ en centimes
  wavPrice = 5000, // 50€ en centimes
  exclusivePrice = 15000, // 150€ en centimes
}: TrackCardProps) {
  const addItem = useCart((s) => s.addItem);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAddToCart = (licenseType: "MP3" | "WAV" | "EXCLUSIVE", price: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: id,
      slug,
      title: `${title} (${licenseType})`,
      priceCents: price,
      currency: "EUR",
      licenseType: licenseType as any,
      qty: 1,
    });
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link to={`/track/${slug}`} className="block">
        {/* Card Container */}
        <div className="border border-border rounded-lg overflow-hidden bg-card hover:border-primary/50 transition-colors">
          {/* Header avec play button et cover */}
          <div className="flex items-center gap-4 p-4 bg-secondary/30">
            {/* Play Button */}
            <button
              onClick={togglePlay}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Audio element caché */}
            {audioPreviewUrl && (
              <audio
                ref={audioRef}
                src={audioPreviewUrl}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
              />
            )}

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{producer}</p>
            </div>

            {/* Mini Cover */}
            <div className="flex-shrink-0 w-16 h-16 rounded bg-secondary overflow-hidden">
              {coverUrl ? (
                <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Track Details */}
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {bpm && (
                <Badge variant="outline" className="font-mono">
                  {bpm} BPM
                </Badge>
              )}
              {trackKey && (
                <Badge variant="outline" className="font-mono">
                  {trackKey}
                </Badge>
              )}
              {genre && (
                <Badge variant="secondary">
                  {genre}
                </Badge>
              )}
            </div>
          </div>

          {/* Pricing Options */}
          <div className="p-4 pt-2 space-y-2">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={handleAddToCart("MP3", mp3Price)}
                className="py-2 px-2 rounded bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors font-semibold text-center"
              >
                MP3
                <div className="text-xs font-bold mt-0.5">{formatPrice(mp3Price)}</div>
              </button>
              <button
                onClick={handleAddToCart("WAV", wavPrice)}
                className="py-2 px-2 rounded bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors font-semibold text-center"
              >
                WAV
                <div className="text-xs font-bold mt-0.5">{formatPrice(wavPrice)}</div>
              </button>
              <button
                onClick={handleAddToCart("EXCLUSIVE", exclusivePrice)}
                className="py-2 px-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold text-center"
              >
                EXCLU
                <div className="text-xs font-bold mt-0.5">{formatPrice(exclusivePrice)}</div>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

