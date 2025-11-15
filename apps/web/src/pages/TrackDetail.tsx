import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTrack } from "../hooks/useTracks";
import { useCart } from "../store/cart";
import Button from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Badge from "../components/ui/Badge";

type LicenseType = "MP3" | "WAV" | "EXCLUSIVE";

interface LicenseOption {
  type: LicenseType;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

export default function TrackDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: track, loading, error } = useTrack(slug);
  const addItem = useCart((s) => s.addItem);
  
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>("WAV");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Construire les options de licence depuis les données du track
  const licenses: LicenseOption[] = track?.licenses
    ? track.licenses
        .filter((l) => ["MP3", "WAV", "EXCLUSIVE"].includes(l.type))
        .map((l) => {
          const baseLicense = {
            type: l.type as LicenseType,
            name: l.type === "MP3" ? "MP3 Lease" : l.type === "WAV" ? "WAV Lease" : "Exclusive Rights",
            price: l.priceCents,
            features: [] as string[],
          };

          // Ajouter les features selon le type
          if (l.type === "MP3") {
            baseLicense.features = [
              "MP3 Format (320kbps)",
              "Non-exclusive rights",
              "Distribution on streaming platforms",
              "Up to 10,000 streams",
              "Tagged version",
            ];
          } else if (l.type === "WAV") {
            baseLicense.features = [
              "WAV Format (High Quality)",
              "Non-exclusive rights",
              "Unlimited streams",
              "Commercial use",
              "Untagged version",
              "Trackout stems available (+€20)",
            ];
            baseLicense.recommended = true;
          } else if (l.type === "EXCLUSIVE") {
            baseLicense.features = [
              "WAV + MP3 Formats",
              "100% Exclusive ownership",
              "Unlimited distribution",
              "Beat removed from store",
              "Full trackout stems included",
              "Producer credit removal option",
              "Copyright transfer",
            ];
          }

          return baseLicense;
        })
    : [
        {
          type: "MP3" as LicenseType,
          name: "MP3 Lease",
          price: 3000,
          features: [
            "MP3 Format (320kbps)",
            "Non-exclusive rights",
            "Distribution on streaming platforms",
            "Up to 10,000 streams",
            "Tagged version",
          ],
        },
        {
          type: "WAV" as LicenseType,
          name: "WAV Lease",
          price: 5000,
          recommended: true,
          features: [
            "WAV Format (High Quality)",
            "Non-exclusive rights",
            "Unlimited streams",
            "Commercial use",
            "Untagged version",
            "Trackout stems available (+€20)",
          ],
        },
        {
          type: "EXCLUSIVE" as LicenseType,
          name: "Exclusive Rights",
          price: 15000,
          features: [
            "WAV + MP3 Formats",
            "100% Exclusive ownership",
            "Unlimited distribution",
            "Beat removed from store",
            "Full trackout stems included",
            "Producer credit removal option",
            "Copyright transfer",
          ],
        },
      ];

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAddToCart = () => {
    if (!track) return;
    
    const license = licenses.find((l) => l.type === selectedLicense);
    if (!license) return;

    addItem({
      productId: track.id,
      slug: track.slug,
      title: `${track.title} (${license.name})`,
      priceCents: license.price,
      currency: "EUR",
      licenseType: selectedLicense as any,
      qty: 1,
    });
  };

  useEffect(() => {
    // Set default license to WAV if available
    if (track?.licenses && track.licenses.length > 0) {
      const wavLicense = track.licenses.find((l) => l.type === "WAV");
      if (wavLicense) {
        setSelectedLicense("WAV");
      } else {
        const firstLicense = track.licenses.find((l) => ["MP3", "WAV", "EXCLUSIVE"].includes(l.type));
        if (firstLicense) {
          setSelectedLicense(firstLicense.type as LicenseType);
        }
      }
    }
  }, [track]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!slug) return <div className="p-4 text-muted-foreground">Slug manquant</div>;
  if (loading) return <div className="p-4 text-muted-foreground">Chargement…</div>;
  if (error) return <div className="p-4 text-destructive">Erreur: {error}</div>;
  if (!track) return <div className="p-4 text-muted-foreground">Beat introuvable</div>;

  const selectedLicenseData = licenses.find((l) => l.type === selectedLicense);

  return (
    <motion.div
      className="w-full py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header avec Player */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Cover Image */}
              <div className="w-full md:w-64 aspect-square rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                {track.coverUrl ? (
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-20 h-20 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{track.title}</h1>
                  <p className="text-xl text-muted-foreground">by .armed</p>
                </div>

                {/* Track Details */}
                <div className="flex flex-wrap gap-2">
                  {track.bpm && (
                    <Badge variant="outline" className="text-sm font-mono">
                      {track.bpm} BPM
                    </Badge>
                  )}
                  {track.key && (
                    <Badge variant="outline" className="text-sm font-mono">
                      {track.key}
                    </Badge>
                  )}
                  {track.genre && (
                    <Badge variant="secondary" className="text-sm">
                      {track.genre}
                    </Badge>
                  )}
                </div>

                {/* Player */}
                <div className="pt-4">
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                  >
                    {isPlaying ? (
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {track.previewUrl && (
                    <audio
                      ref={audioRef}
                      src={track.previewUrl}
                      onEnded={() => setIsPlaying(false)}
                      onPause={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                    />
                  )}

                  <p className="text-sm text-muted-foreground mt-3">
                    Click to preview (watermarked)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* License Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Your License</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {licenses.map((license) => (
                <motion.button
                  key={license.type}
                  onClick={() => setSelectedLicense(license.type)}
                  whileHover={{ y: -4 }}
                  className={`relative p-6 rounded-lg border-2 text-left transition-all ${
                    selectedLicense === license.type
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {license.recommended && (
                    <Badge className="absolute top-2 right-2 bg-primary">
                      Popular
                    </Badge>
                  )}

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg">{license.name}</h3>
                      <p className="text-3xl font-bold text-primary mt-2">
                        {formatPrice(license.price)}
                      </p>
                    </div>

                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {license.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="flex-1 text-lg py-6"
            onClick={handleAddToCart}
          >
            Add to Cart — {selectedLicenseData && formatPrice(selectedLicenseData.price)}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>

        {/* Additional Info */}
        {track.description && (
          <Card>
            <CardHeader>
              <CardTitle>About This Beat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{track.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
