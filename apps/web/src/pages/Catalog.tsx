// apps/web/src/pages/Catalog.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "../components/catalog/ProductCard";
import ErrorState from "../components/catalog/ErrorState";
import Button from "../components/ui/Button";
import { useProducts } from "../hooks/useProducts";

export default function Catalog() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"createdAt" | "price">("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const pageSize = 12;

  const { data, meta, loading, error } = useProducts({ page, pageSize, sort, order });

  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => Math.min(meta?.totalPages ?? 1, p + 1));

  return (
    <div className="w-full py-8">
      {/* Header avec filtres */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sound Kits</h1>
          {meta && (
            <p className="text-muted-foreground mt-1">
              {meta.total} products available
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Sort by:</label>
          <select
            className="h-9 px-3 rounded-md bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={`${sort}-${order}`}
            onChange={(e) => {
              const [newSort, newOrder] = e.target.value.split("-") as ["createdAt" | "price", "asc" | "desc"];
              setSort(newSort);
              setOrder(newOrder);
            }}
          >
            <option value="createdAt-desc">Newest</option>
            <option value="createdAt-asc">Oldest</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-secondary rounded-lg animate-pulse" />
              <div className="h-4 bg-secondary rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-secondary rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && <ErrorState message={error} />}

      {/* Empty state */}
      {!loading && !error && data?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No products available yet.</p>
        </div>
      )}

      {/* Products grid */}
      {!loading && !error && data && data.length > 0 && (
        <>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {data.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
              >
                <ProductCard
                  id={product.id}
                  slug={product.slug}
                  title={product.title}
                  priceCents={product.priceCents}
                  originalPriceCents={Math.random() > 0.5 ? product.priceCents + 1000 : undefined}
                  coverUrl={product.coverUrl ?? undefined}
                  onSale={Math.random() > 0.5}
                  reviewCount={Math.floor(Math.random() * 25) + 1}
                  rating={5}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {meta?.page} of {meta?.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={meta?.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={!!(meta && meta.page >= meta.totalPages)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
