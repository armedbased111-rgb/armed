export default function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 animate-pulse">
      <div className="aspect-square bg-secondary rounded mb-3" />
      <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
      <div className="h-4 bg-secondary rounded w-1/3" />
    </div>
  );
}
