import { useState } from "react";
import { motion } from "framer-motion";
import TrackCard from "../components/tracks/TrackCard";
import ErrorState from "../components/catalog/ErrorState";
import Button from "../components/ui/Button";
import { useTracks } from "../hooks/useTracks";

export default function Tracks() {
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState<string>("all");
  const [sort, setSort] = useState<"createdAt" | "price" | "bpm">("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const pageSize = 10;

  const { data: tracks, meta, loading, error } = useTracks({
    page,
    pageSize,
    genre: genre !== "all" ? genre : undefined,
    sort,
    order,
  });

  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => Math.min(meta?.totalPages ?? 1, p + 1));

  // Genres disponibles
  const genres = ["all", "Trap", "Drill", "R&B", "Afrobeat", "Jersey", "Phonk"];

  return (
    <div className="w-full py-8">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Beats</h1>
          <p className="text-lg text-muted-foreground">
            Exclusive beats for your next project
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="mb-8 pb-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Genre Filter */}
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-2 block">Genre:</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGenre(g);
                    setPage(1); // Reset to first page when filter changes
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    genre === g
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {g === "all" ? "All Genres" : g}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Sort by:</label>
            <select
              className="h-10 px-4 rounded-md bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={`${sort}-${order}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split("-") as ["createdAt" | "price" | "bpm", "asc" | "desc"];
                setSort(newSort);
                setOrder(newOrder);
                setPage(1); // Reset to first page when sort changes
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="bpm-desc">BPM: High to Low</option>
              <option value="bpm-asc">BPM: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && <ErrorState message={error} />}

      {/* Empty State */}
      {!loading && !error && (!tracks || tracks.length === 0) && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No beats available yet.</p>
        </div>
      )}

      {/* Tracks List */}
      {!loading && !error && tracks && tracks.length > 0 && (
        <>
          <motion.div
            className="space-y-4 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {tracks.map((track, idx) => {
              // Trouver les prix depuis les licences
              const mp3License = track.licenses?.find((l) => l.type === "MP3");
              const wavLicense = track.licenses?.find((l) => l.type === "WAV");
              const exclusiveLicense = track.licenses?.find((l) => l.type === "EXCLUSIVE");

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <TrackCard
                    id={track.id}
                    slug={track.slug}
                    title={track.title}
                    producer=".armed"
                    bpm={track.bpm}
                    key={track.key}
                    genre={track.genre}
                    audioPreviewUrl={track.previewUrl}
                    coverUrl={track.coverUrl}
                    mp3Price={mp3License?.priceCents ?? 3000}
                    wavPrice={wavLicense?.priceCents ?? 5000}
                    exclusivePrice={exclusiveLicense?.priceCents ?? 15000}
                  />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {meta?.page} of {meta?.totalPages} — {meta?.total} beats
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
