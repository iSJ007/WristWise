import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, resetPassword } from '../api/admin';
import type { UserSummary } from '../types';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // per-user reset form state
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    getUsers()
      .then(setUsers)
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  function openReset(userId: number) {
    setActiveUserId(userId);
    setNewPassword('');
    setFormError('');
    setSuccessMsg('');
  }

  function closeReset() {
    setActiveUserId(null);
    setNewPassword('');
    setFormError('');
  }

  async function handleReset(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!activeUserId) return;

    setSubmitting(true);
    setFormError('');
    setSuccessMsg('');

    try {
      await resetPassword(activeUserId, newPassword);
      setSuccessMsg('Password updated.');
      setNewPassword('');
      setActiveUserId(null);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="p-8 text-gray-500">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>

      {successMsg && (
        <p className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          {successMsg}
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="font-medium text-gray-900">
                {u.username}
                {u.isAdmin && (
                  <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                    admin
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>

            <div className="flex items-center gap-3">
              {activeUserId === u.id ? (
                <form onSubmit={handleReset} className="flex items-center gap-2">
                  <input
                    type="password"
                    placeholder="New password"
                    minLength={6}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-44"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {submitting ? '...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={closeReset}
                    className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1.5"
                  >
                    Cancel
                  </button>
                  {formError && <p className="text-xs text-red-500">{formError}</p>}
                </form>
              ) : (
                <button
                  onClick={() => openReset(u.id)}
                  className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Reset password
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
