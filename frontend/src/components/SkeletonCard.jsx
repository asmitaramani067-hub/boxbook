export default function SkeletonCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-white/5 rounded-lg w-3/4" />
        <div className="h-4 bg-white/5 rounded-lg w-1/2" />
        <div className="h-4 bg-white/5 rounded-lg w-1/3" />
        <div className="h-10 bg-white/5 rounded-xl mt-4" />
      </div>
    </div>
  );
}
