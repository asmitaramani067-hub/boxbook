import { FiStar } from 'react-icons/fi';

export default function StarRating({ rating, onRate, size = 'md' }) {
  const sz = size === 'sm' ? 'text-sm' : 'text-xl';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => onRate?.(s)} disabled={!onRate}
          className={`${sz} transition-colors ${s <= rating ? 'text-yellow-400' : 'text-gray-600'} ${onRate ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}>
          <FiStar fill={s <= rating ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}
