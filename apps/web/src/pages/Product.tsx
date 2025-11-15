// apps/web/src/pages/Product.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProduct } from "../hooks/useProduct";
import { useCart } from "../store/cart";
import { formatEUR } from "../utils/format";
import LicenseSelector from "../components/product/LicenseSelector";
import AudioPlayer from "../components/product/AudioPlayer";
import Button from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { generateWaveformMock } from "../utils/waveformMock";

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useProduct(slug);
  const [license, setLicense] = useState<"STANDARD" | "EXTENDED">("STANDARD");
  const addItem = useCart((s) => s.addItem);

  useEffect(() => { setLicense("STANDARD"); }, [slug]);

  if (!slug) return <div className="p-4 text-muted-foreground">Slug manquant</div>;
  if (loading) return <div className="p-4 text-muted-foreground">Chargement…</div>;
  if (error) return <div className="p-4 text-destructive">Erreur: {error}</div>;
  if (!data) return <div className="p-4 text-muted-foreground">Produit introuvable</div>;

  const current = data.licenses?.find((l) => l.type === license) ?? null;
  const displayPrice = formatEUR(current?.priceCents ?? data.priceCents);
  const waveform =
    Array.isArray(data.waveformData) && data.waveformData.length > 0
      ? (data.waveformData as number[])
      : generateWaveformMock(1024);

  const onAddToCart = () => {
    const chosen = data.licenses?.find((l) => l.type === license);
    const priceCents = chosen?.priceCents ?? data.priceCents;
    const currency = chosen?.currency ?? data.currency;
    addItem({ productId: data.id, slug: data.slug, title: data.title, priceCents, currency, licenseType: license, qty: 1 });
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="w-full aspect-square md:w-44 md:h-44 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground overflow-hidden">
              {data.coverUrl ? (
                <img src={data.coverUrl} alt={data.title} className="w-full h-full object-cover" />
              ) : ("Cover")}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
                <p className="text-xl text-muted-foreground mt-1">{formatEUR(data.priceCents)}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {data.bpm && <div className="text-muted-foreground">BPM: <span className="text-foreground">{data.bpm}</span></div>}
                {data.key && <div className="text-muted-foreground">Key: <span className="text-foreground">{data.key}</span></div>}
              </div>

              {data.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((t) => (
                    <span key={t} className="px-2 py-1 rounded-md bg-secondary border border-border text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {data.description && <p className="text-muted-foreground">{data.description}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <AudioPlayer src={data.previewUrl ?? undefined} waveformData={waveform} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <LicenseSelector licenses={data.licenses} value={license} onChange={setLicense} />
            <div className="text-2xl font-bold">Prix: {displayPrice}</div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" size="lg" onClick={onAddToCart}>
          Ajouter au panier — {displayPrice}
        </Button>
        <Button className="w-full sm:w-auto" variant="outline" size="lg" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>
    </motion.div>
  );
}
