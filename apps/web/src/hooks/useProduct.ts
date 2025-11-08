// apps/web/src/hooks/useProduct.ts
import { useEffect, useState } from "react";

export type Product = {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  currency: string;
  tags: string[];
  bpm: number | null;
  key: string | null;
  description: string | null;
  // Optionnel si tu ajoutes plus tard ces champs côté API:
  coverUrl?: string | null;
  previewUrl?: string | null;
  durationSec?: number | null;
};

export function useProduct(slug?: string) {
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setLoading(true);
    fetch(`http://localhost:4000/products/${slug}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        setData(json);
        setError(null);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(String(e));
        setData(null);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [slug]);

  return { data, loading, error };
}
