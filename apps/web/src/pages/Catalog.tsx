// apps/web/src/pages/Catalog.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import SkeletonCard from "../components/catalog/SkeletonCard";
import ErrorState from "../components/catalog/ErrorState";
import { formatEUR } from "../utils/format";
import { useProducts } from "../hooks/useProducts";

export default function Catalog() {
  // Contrôles UI: pagination et tri
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"createdAt" | "price">("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const pageSize = 12;

  const { data, meta, loading, error } = useProducts({ page, pageSize, sort, order });

  // Handlers: “setState” comme en React
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => Math.min(meta?.totalPages ?? 1, p + 1));

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Catalog</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-400">Tri:</label>
          <select
            className="h-10 px-3 rounded-md bg-neutral-900 border border-neutral-700"
            value={sort}
            onChange={(e) => setSort(e.target.value as "createdAt" | "price")}
          >
            <option value="createdAt">Nouveautés</option>
            <option value="price">Prix</option>
          </select>

          <select
            className="h-10 px-3 rounded-md bg-neutral-900 border border-neutral-700"
            value={order}
            onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </header>

      {/* États */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && !loading && <ErrorState message={error} />}

      {!loading && !error && data?.length === 0 && (
        <div className="rounded-lg border border-neutral-700 p-4">
          <p className="text-neutral-400">Aucun produit disponible.</p>
        </div>
      )}

      {/* Grille de produits */}
      {!loading && !error && data && data.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="rounded-lg border border-neutral-700 hover:border-neutral-500 transition">
                <div className="p-4">
                  {/* Cover placeholder: on pourrait mettre une image plus tard */}
                  <div className="h-40 bg-neutral-800 rounded mb-3 flex items-center justify-center text-neutral-400">
                    Cover
                  </div>
                  <h3 className="text-lg font-medium">{p.title}</h3>
                  <p className="text-neutral-400">{formatEUR(p.priceCents)}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-neutral-400">
              Page {meta?.page} / {meta?.totalPages} — {meta?.total} produits
            </p>
            <div className="flex gap-2">
              <button
                className="h-10 px-3 rounded-md bg-neutral-900 border border-neutral-700 disabled:opacity-50"
                onClick={prevPage}
                disabled={meta?.page === 1}
              >
                Précédent
              </button>
              <button
                className="h-10 px-3 rounded-md bg-neutral-900 border border-neutral-700 disabled:opacity-50"
                onClick={nextPage}
                disabled={meta && meta.page >= meta.totalPages}
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
