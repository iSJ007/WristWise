import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import type { WatchSummary } from '../types';

function getWatchImage(id: number) {
  return `/watch${(id % 8) + 1}.png`;
}

export default function WatchCard({ watch }: { watch: WatchSummary }) {
  return (
    <Link
      to={`/watches/${watch.id}`}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
    >
      <div className="bg-gray-50 flex items-center justify-center p-4 h-44">
        <img
          src={getWatchImage(watch.id)}
          alt={watch.name}
          className="h-full object-contain"
        />
      </div>
      <div className="p-4 flex flex-col gap-1.5">
        <div className="text-xs font-semibold text-teal-600 uppercase tracking-widest">
          {watch.brand}
        </div>
        <div className="font-semibold text-gray-900 leading-snug">{watch.name}</div>
        <div className="text-sm text-gray-400">{watch.reference}</div>
        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-100">
          <StarRating rating={watch.averageRating} />
          <span className="text-xs text-gray-400">
            {watch.reviewCount === 0
              ? 'No reviews'
              : `${watch.reviewCount} review${watch.reviewCount > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
