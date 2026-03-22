export default function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="h-48" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="p-4 space-y-3">
        <div className="h-4 rounded-lg w-3/4" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-3 rounded-lg w-1/2" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="h-3 rounded-lg w-1/3" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="h-10 rounded-xl mt-4" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
    </div>
  );
}
