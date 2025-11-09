// apps/web/src/pages/Product.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProduct } from "../hooks/useProduct";
import { useCart } from "../store/cart";
import { formatEUR } from "../utils/format";
import LicenseSelector from "../components/product/LicenseSelector";
import AudioPlayer from "../components/product/AudioPlayer";
import { generateWaveformMock } from "../utils/waveformMock";

export default function Product() {
  const { slug } = useParams();
  const { data, loading, error } = useProduct(slug);
  const [license, setLicense] = useState<"STANDARD" | "EXTENDED">("STANDARD");
  const addItem = useCart((s) => s.addItem);

    useEffect(() => { setLicense("STANDARD"); }, [slug]);

    if (!slug) return <div className="p-4">Slug manquant</div>;
    if (loading) return <div className="p-4">Chargement…</div>;
    if (error) return <div className="p-4">Erreur: {error}</div>;
    if (!data) return <div className="p-4">Produit introuvable</div>;

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
      <div className="grid gap-6">
        {/* Header card: pile en mobile → row en md+, pas de largeurs fixes trop grandes */}
        <div className="rounded-lg border border-neutral-700 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            {/* Cover: w-full en mobile, carré raisonnable en md+ */}
            <div className="w-full aspect-video md:w-44 md:h-44 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 overflow-hidden">
              {data.coverUrl ? (
                <img src={data.coverUrl} alt={data.title} className="w-full h-full object-cover" />
              ) : ("Cover")}
            </div>

            {/* Métadonnées produit: flex-1 pour prendre la place disponible */}
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">{data.title}</h1>
              <p className="text-neutral-400">{formatEUR(data.priceCents)}</p>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {data.bpm && <div className="text-sm text-neutral-400">BPM: {data.bpm}</div>}
                {data.key && <div className="text-sm text-neutral-400">Key: {data.key}</div>}
                {data.tags?.length > 0 && (
                  <div className="text-sm text-neutral-400">
                    <div className="flex flex-wrap gap-2">
                      {data.tags.map((t) => (
                        <span key={t} className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {data.description && <p className="mt-3 text-neutral-200">{data.description}</p>}
            </div>
          </div>
        </div>

        {/* Player: contenu fluid, jamais plus large que le container de AppContainer */}
        <div className="rounded-lg border border-neutral-700 p-4">
          <AudioPlayer src={data.previewUrl ?? undefined} waveformData={waveform} />
        </div>

        {/* Licence + prix: pile en mobile → rangée en md+ */}
        <div className="rounded-lg border border-neutral-700 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <LicenseSelector licenses={data.licenses} value={license} onChange={setLicense} />
            <div className="text-lg font-semibold">Prix: {displayPrice}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="h-11 px-4 rounded bg-violet-600 text-white hover:bg-violet-700 w-full sm:w-auto" onClick={onAddToCart}>
            Ajouter au panier — {displayPrice}
          </button>
          <button className="h-11 px-4 rounded bg-neutral-900 text-neutral-200 border border-neutral-700 w-full sm:w-auto" onClick={() => history.back()}>
            Retour
          </button>
        </div>
      </div>
    );
  }
  