import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/pricing', label: 'Pricing' },
];

export default function Layout({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    api.setAuthHeaders(user ? { 'X-User-Id': user.email } : {});
  }, [user]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const linkClass = (isActive) =>
    `text-sm font-medium transition-colors block py-2 ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}`;


  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-semibold text-xl text-primary-600 hover:text-primary-700 shrink-0">
              <span className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white text-sm font-bold">3D</span>
              UE 3D Viewer
            </Link>

            {/* Desktop: when signed in only Dashboard, Compare, Integrations, Sign out; otherwise Home, About, Pricing, Sign in, Sign up */}
            <div className="hidden md:flex items-center gap-5 flex-wrap justify-end">
              {user ? (
                <>
                  <NavLink to="/dashboard" className={({ isActive }) => linkClass(isActive)}>Dashboard</NavLink>
                  <NavLink to="/compare" className={({ isActive }) => linkClass(isActive)}>Compare</NavLink>
                  <NavLink to="/integrations" className={({ isActive }) => linkClass(isActive)}>Integrations</NavLink>
                  <button type="button" onClick={handleSignOut} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  {navLinks.map(({ to, label }) => (
                    <NavLink key={to} to={to} className={({ isActive }) => linkClass(isActive)}>
                      {label}
                    </NavLink>
                  ))}
                  <Link to="/signin" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign in</Link>
                  <Link to="/signup" className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: menu button + dropdown with all links (including Home, About, Pricing) */}
            <div className="md:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile dropdown: when signed in only Dashboard, Compare, Integrations, Sign out; otherwise Home, About, Pricing, Sign in, Sign up */}
          {menuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white py-3">
              <div className="flex flex-col gap-0">
                {user ? (
                  <>
                    <NavLink to="/dashboard" className={({ isActive }) => linkClass(isActive)}>Dashboard</NavLink>
                    <NavLink to="/compare" className={({ isActive }) => linkClass(isActive)}>Compare</NavLink>
                    <NavLink to="/integrations" className={({ isActive }) => linkClass(isActive)}>Integrations</NavLink>
                    <button type="button" onClick={handleSignOut} className="text-left text-sm font-medium text-gray-600 hover:text-gray-900 py-2">
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    {navLinks.map(({ to, label }) => (
                      <NavLink key={to} to={to} className={({ isActive }) => linkClass(isActive)}>
                        {label}
                      </NavLink>
                    ))}
                    <Link to="/signin" className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2">Sign in</Link>
                    <Link to="/signup" className="text-sm font-medium text-primary-600 hover:text-primary-700 py-2">Sign up</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>
      <main className={`flex-1 ${isDashboard ? 'min-h-0 flex flex-col' : ''}`}>{children}</main>
      {!isDashboard && (
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-semibold text-white">
              <span className="w-6 h-6 rounded bg-primary-500 flex items-center justify-center text-xs text-white">3D</span>
              UE 3D Viewer
            </div>
            <div className="flex gap-6">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            </div>
          </div>
          <p className="mt-6 text-sm text-center sm:text-left">
            View 3D models in the browser with Unreal Engine Pixel Streaming.
          </p>
        </div>
      </footer>
      )}
    </div>
  );
}
