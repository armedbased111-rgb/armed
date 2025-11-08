export default function SkeletonCard() {
    //skeleton = Placeholder avant le chargement (visuel)
    return (
        <div className="rounded-lg border border-neutral-800 p-4 animate-pulse">
            <div className="h-40 bg-neutral-800 rounded mb-3" />
            <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2" />
            <div className="h-4 bg-neutral-800 rounded w-1/3" />
        </div>
    );
}