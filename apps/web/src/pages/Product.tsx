// apps/web/src/pages/Product.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProduct } from "../hooks/useProduct";
import AudioPlayer from "../components/product/AudioPlayer";
import { generateWaveformMock } from "../utils/waveformMock";
import LicenseSelector from "../components/product/LicenseSelector";


function formatEUR(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default function Product() {
  const { slug } = useParams();
  const { data, loading, error } = useProduct(slug);
  const [license, setLicense] = useState<"STANDARD" | "EXTENDED">("STANDARD");

  useEffect(() => {
    setLicense("STANDARD"); // reset licence au changement de produit
  }, [slug]);

  if (!slug) return <div className="p-4">Slug manquant</div>;
  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-700 p-4 animate-pulse">
        <div className="h-6 w-1/3 bg-neutral-800 rounded mb-3" />
        <div className="h-4 w-1/2 bg-neutral-800 rounded mb-6" />
        <div className="h-40 bg-neutral-800 rounded mb-4" />
        <div className="h-3 bg-neutral-800 rounded" />
      </div>
    );
  }
  if (error) return <div className="rounded-lg border border-red-600 p-4 bg-red-950/20 text-red-400">Erreur: {error}</div>;
  if (!data) return <div className="p-4">Produit introuvable</div>;

  const currentLicense = data.licenses?.find((l) => l.type === license);
  const displayPrice = currentLicense
    ? currentLicense.currency === "EUR"
      ? formatEUR(currentLicense.priceCents)
      : `${currentLicense.priceCents} ${currentLicense.currency}`
    : formatEUR(data.priceCents);
  const samples =
    Array.isArray(data.waveformData) && data.waveformData.length > 0
      ? (data.waveformData as number[])
      : generateWaveformMock(1024);
  const wf = Array.isArray(data.waveformData) ? (data.waveformData as number[]) : undefined;


  return (
    <div className="grid gap-6">
      {/* Header produit */}
      <div className="rounded-lg border border-neutral-700 p-4">
        <div className="flex gap-4">
          {/* Cover */}
          <div className="w-40 h-40 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400">
            {data.coverUrl ? <img src={data.coverUrl} alt={data.title} className="w-full h-full object-cover rounded" /> : "Cover"}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{data.title}</h1>
            <p className="text-neutral-400">{formatEUR(data.priceCents)}</p>

            <div className="mt-2 text-sm text-neutral-400 flex flex-wrap gap-3">
              {data.bpm && <span>BPM: {data.bpm}</span>}
              {data.key && <span>Key: {data.key}</span>}
              {data.tags?.length > 0 && (
                <span className="flex gap-2 flex-wrap">
                  {data.tags.map((t) => (
                    <span key={t} className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs">
                      {t}
                    </span>
                  ))}
                </span>
              )}
            </div>

            {data.description && <p className="mt-3">{data.description}</p>}
          </div>
        </div>
      </div>

      {/* Player audio */}
      <AudioPlayer src={data.previewUrl ?? undefined} waveformData={wf} />
 {/* Sélecteur de licence */}
      <LicenseSelector licenses={data.licenses} value={license} onChange={setLicense} />

      {/* Actions */}
      <div className="flex gap-2 items-center">
        <button
          className="h-10 px-4 rounded bg-violet-600 text-white hover:bg-violet-700"
          onClick={() => {
            const chosen = data.licenses?.find((l) => l.type === license);
            const priceCents = chosen?.priceCents ?? data.priceCents;
            const currency = chosen?.currency ?? data.currency;
            // Ici, on prépare S16: dispatch vers un Cart Context
            alert(`Ajouté au panier: ${data.title} (${license}) — ${currency === "EUR" ? formatEUR(priceCents) : `${priceCents} ${currency}`}`);
          }}
        >
          Ajouter au panier — {displayPrice}
        </button>

        <button className="h-10 px-4 rounded bg-neutral-900 text-neutral-200 border border-neutral-700" onClick={() => history.back()}>
          Retour
        </button>
      </div>
    </div>
  );
}
