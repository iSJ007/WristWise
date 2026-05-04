import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../api/wishlist';
import { useAuth } from '../context/AuthContext';
import type { WishlistItem } from '../types';

export default function WishlistPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    getWishlist()
      .then(setItems)
      .catch(() => setError('Failed to load wishlist.'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  async function handleRemove(watchId: number) {
    try {
      await removeFromWishlist(watchId);
      setItems(prev => prev.filter(i => i.watchId !== watchId));
    } catch {
      setError('Failed to remove watch. Please try again.');
    }
  }

  if (loading) return <p className="text-gray-400 p-10">Loading...</p>;

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Wishlist</h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">Your wishlist is empty.</p>
          <Link
            to="/"
            className="text-sm font-semibold text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Browse Watches
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div
              key={item.watchId}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between"
            >
              <Link to={`/watches/${item.watchId}`} className="hover:underline">
                <div className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-0.5">
                  {item.brand}
                </div>
                <div className="font-semibold text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-400">{item.reference}</div>
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleRemove(item.watchId)}
                  className="text-sm text-red-400 hover:text-red-600 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
