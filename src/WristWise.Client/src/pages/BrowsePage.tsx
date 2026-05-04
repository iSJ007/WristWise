import { useState, useEffect } from 'react';
import WatchCard from '../components/WatchCard';
import { getWatches, searchWatches } from '../api/watches';
import type { WatchSummary } from '../types';

export default function BrowsePage() {
  const [query, setQuery] = useState('');
  const [watches, setWatches] = useState<WatchSummary[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 20;

  // Load paginated watches when not searching
  useEffect(() => {
    if (query) return;
    setLoading(true);
    setError('');
    getWatches(page, pageSize)
      .then(data => {
        setWatches(data.watches);
        setTotal(data.total);
      })
      .catch(() => setError('Failed to load watches. Please try again.'))
      .finally(() => setLoading(false));
  }, [page, query]);

  // Debounced search with AbortController to cancel stale requests
  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      searchWatches(query, controller.signal)
        .then(data => {
          setWatches(data);
          setTotal(data.length);
        })
        .catch(err => {
          if (err.name !== 'AbortError') setError('Search failed. Please try again.');
        })
        .finally(() => setLoading(false));
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Watches</h1>
        <input
          type="text"
          placeholder="Search by brand, name or reference..."
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          className="w-full max-w-xl border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : watches.length === 0 ? (
        <p className="text-gray-400">No watches found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {watches.map(watch => (
            <WatchCard key={watch.id} watch={watch} />
          ))}
        </div>
      )}

      {!query && totalPages > 1 && (
        <div className="flex items-center gap-3 mt-10 justify-center">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
