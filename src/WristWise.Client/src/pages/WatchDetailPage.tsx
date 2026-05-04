import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { getWatchById } from '../api/watches';
import { getReviews, createReview, deleteReview } from '../api/reviews';
import { addToWishlist, removeFromWishlist } from '../api/wishlist';
import { useAuth } from '../context/AuthContext';
import type { WatchDetail, Review } from '../types';

export default function WatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const watchId = Number(id);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [watch, setWatch] = useState<WatchDetail | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    getWatchById(watchId)
      .then(data => {
        setWatch(data);
        setWishlisted(data.isWishlisted);
      })
      .catch(() => setLoadError('Watch not found or failed to load.'));
    getReviews(watchId).then(setReviews);
  }, [watchId]);

  async function toggleWishlist() {
    if (!token) {
      navigate('/login');
      return;
    }
    setToggling(true);
    try {
      if (wishlisted) {
        await removeFromWishlist(watchId);
        showToast('Removed from wishlist');
      } else {
        await addToWishlist(watchId);
        showToast('Added to wishlist!');
      }
      setWishlisted(w => !w);
    } catch {
      showToast('Something went wrong.');
    } finally {
      setToggling(false);
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  }

  async function handleSubmitReview(e: React.SyntheticEvent) {
    e.preventDefault();
    setReviewError('');
    setSubmitting(true);
    try {
      const review = await createReview(watchId, rating, comment);
      setReviews(prev => [review, ...prev]);
      setComment('');
      setRating(5);
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview(reviewId: number) {
    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch {
      showToast('Failed to delete review.');
    }
  }

  const hasReviewed = reviews.some(r => r.username === user?.username);

  if (loadError) return <p className="text-red-500 p-10">{loadError}</p>;
  if (!watch) return <p className="text-gray-400 p-10">Loading...</p>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="bg-gray-50 rounded-2xl flex items-center justify-center p-8 mb-6">
          <img
            src={`/watch${(watch.id % 8) + 1}.png`}
            alt={watch.name}
            className="h-64 object-contain"
          />
        </div>
        <div className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">
          {watch.brand}
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{watch.name}</h1>
            <p className="text-gray-400 mt-1">{watch.reference}</p>
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={watch.averageRating} />
              <span className="text-sm text-gray-400">
                {watch.reviewCount === 0
                  ? 'No reviews yet'
                  : `${watch.averageRating.toFixed(1)} · ${watch.reviewCount} review${watch.reviewCount > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
          <button
            onClick={toggleWishlist}
            disabled={toggling}
            className={`shrink-0 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 active:scale-95 ${
              toggling ? 'opacity-60 scale-95' : 'scale-100'
            } ${
              wishlisted
                ? 'bg-teal-50 border-teal-300 text-teal-700 hover:bg-teal-100'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {toggling ? '...' : wishlisted ? '★ Wishlisted' : '☆ Add to Wishlist'}
          </button>
        </div>
      </div>

      {/* Specs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Specifications
        </h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
          <Spec label="Case Material" value={watch.caseMaterial} />
          <Spec label="Diameter" value={watch.diameter} />
          <Spec label="Height" value={watch.height} />
          <Spec label="Glass" value={watch.glass} />
          <Spec label="Water Resistance" value={watch.waterResistance} />
          <Spec label="Shape" value={watch.shape} />
          <Spec label="Dial Color" value={watch.dialColor} />
          <Spec label="Indexes" value={watch.indexes} />
          <Spec label="Hands" value={watch.hands} />
          <Spec label="Movement" value={watch.movementCaliber} />
          <Spec label="Functions" value={watch.movementFunctions} />
          <Spec label="Case Back" value={watch.back} />
          {watch.isLimited && (
            <Spec
              label="Limited Edition"
              value={watch.limitedUnits ? `${watch.limitedUnits.toLocaleString()} pieces` : 'Yes'}
            />
          )}
        </dl>
        {watch.description && (
          <p className="mt-5 pt-5 border-t border-gray-100 text-sm text-gray-600 leading-relaxed">
            {watch.description}
          </p>
        )}
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>

        {token && !hasReviewed && (
          <form
            onSubmit={handleSubmitReview}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6"
          >
            <h3 className="font-semibold text-gray-800 mb-3">Write a Review</h3>
            <div className="mb-3">
              <label className="text-sm text-gray-500 block mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              id="comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your thoughts on this watch..."
              rows={3}
              required
              maxLength={500}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
            <div className="flex items-center justify-between mt-1 mb-2">
              {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
              <span className="text-xs text-gray-400 ml-auto">{comment.length}/500</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-700 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map(review => (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <img src="/user.png" alt={review.username} className="h-8 w-8 rounded-full object-cover" />
                    <span className="font-semibold text-gray-800 text-sm">{review.username}</span>
                    <StarRating rating={review.rating} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    {review.username === user?.username && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
      <dd className="text-gray-800 font-medium">{value}</dd>
    </div>
  );
}
