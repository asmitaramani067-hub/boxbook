export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-48 bg-ink-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 rounded-lg w-3/4 bg-ink-100" />
        <div className="h-3 rounded-lg w-1/2 bg-ink-100" />
        <div className="h-3 rounded-lg w-1/3 bg-ink-100" />
        <div className="h-10 rounded-xl mt-4 bg-ink-100" />
      </div>
    </div>
  );
}
