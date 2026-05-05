import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="bg-[#0f2540] text-white px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="WristWise" className="h-20 w-20 object-contain" />
          <span className="text-xl font-bold tracking-tight">WristWise</span>
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors">
            Browse
          </Link>

          {user ? (
            <>
              <Link to="/wishlist" className="text-gray-300 hover:text-white transition-colors">
                Wishlist
              </Link>
              {user.isAdmin && (
                <Link to="/admin" className="text-gray-300 hover:text-white transition-colors">
                  Admin
                </Link>
              )}
              <span className="text-gray-400">Hi, {user.username}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
