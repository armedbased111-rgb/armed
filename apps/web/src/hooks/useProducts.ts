// apps/web/src/hooks/useProducts.ts
import { useEffect, useState } from "react";
import type { Product } from "./useProduct";

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

export function useProducts(params?: {
  page?: number;
  pageSize?: number;
  sort?: "createdAt" | "price";
  order?: "asc" | "desc";
}) {
  const [data, setData] = useState<Product[] | null>(null);
  const [meta, setMeta] = useState<ProductsResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 12;
  const sort = params?.sort ?? "createdAt";
  const order = params?.order ?? "desc";

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const url = `http://localhost:4000/products?page=${page}&pageSize=${pageSize}&sort=${sort}&order=${order}`;

    fetch(url, { signal: controller.signal })
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

    return () => controller.abort();
  }, [page, pageSize, sort, order]);

  return { data, meta, loading, error };
}
