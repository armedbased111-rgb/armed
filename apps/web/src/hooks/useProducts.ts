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
    createdAt: string;
    updatedAt: string;
  };

type ProductsResponse = {
  data: Product[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    sort: "createdAt" | "price";
    order: "asc" | "desc";
  };
};

export function useProducts(params?: { page?: number; pageSize?: number; sort?: "createdAt" | "price"; order?: "asc" | "desc" }) {
    const [data, setData] = useState<Product[] | null>(null);
    const [meta, setMeta] = useState<ProductsResponse["meta"] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 12;
    const sort = params?.sort ?? "createdAt";
    const order = params?.order ?? "desc";

    useEffect(() => {
        // Ce useEffect est notre “cycle de vie”: on monte → on fetch l’API
        const controller = new AbortController();
        setLoading(true);
        fetch(`http://localhost:4000/products?page=${page}&pageSize=${pageSize}&sort=${sort}&order=${order}`, {
          signal: controller.signal,
        })
          .then(async (r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const json: ProductsResponse = await r.json();
            setData(json.data);
            setMeta(json.meta);
            setError(null);
          })
          .catch((e) => {
            if (e.name === "AbortError") return;
            setError(String(e));
            setData(null);
            setMeta(null);
          })
          .finally(() => setLoading(false));

        // Cleanup: si le composant se démonte, on annule la requête
        return () => controller.abort();
      }, [page, pageSize, sort, order]);

      return { data, meta, loading, error };
    }