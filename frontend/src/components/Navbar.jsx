import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiX, FiLogOut, FiGrid, FiCalendar,
  FiPlusCircle, FiChevronDown, FiCompass, FiPhone
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setDropOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = user?.role === 'owner'
    ? [
        { to: '/owner/dashboard', label: 'Dashboard', icon: FiGrid },
        { to: '/owner/add-turf', label: 'Add Turf', icon: FiPlusCircle },
      ]
    : [
        { to: '/turfs', label: 'Find Turfs', icon: FiGrid },
        { to: '/explore', label: 'Explore', icon: FiCompass },
        ...(user ? [{ to: '/bookings', label: 'My Bookings', icon: FiCalendar }] : []),
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/5 border-b border-ink-100'
        : 'bg-white border-b border-ink-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="relative w-9 h-9 flex items-center justify-center">
              {/* Cricket ball */}
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="group-hover:rotate-12 transition-transform duration-300">
                {/* Ball */}
                <circle cx="18" cy="18" r="16" fill="url(#ballGrad)" />
                {/* Seam lines */}
                <path d="M10 10 Q18 16 26 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                <path d="M10 26 Q18 20 26 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                {/* Bat overlay */}
                <rect x="22" y="4" width="5" height="14" rx="2.5" fill="#D97706" />
                <rect x="23.5" y="17" width="2" height="5" rx="1" fill="#92400E" />
                <defs>
                  <radialGradient id="ballGrad" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="#4CAF50" />
                    <stop offset="100%" stopColor="#1B5E20" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-ink-900">
              Pitch<span className="text-pitch-700">Up</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(l.to)
                    ? 'bg-pitch-700 text-white shadow-md shadow-pitch-700/30'
                    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                }`}>
                <l.icon className="text-sm flex-shrink-0" />
                {l.label}
              </Link>
            ))}
            <a href="/#contact"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-all duration-200">
              <FiPhone className="text-sm flex-shrink-0" />
              Contact
            </a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button onClick={() => setDropOpen(d => !d)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-ink-200 hover:border-pitch-400 hover:shadow-md bg-white transition-all duration-200">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pitch-600 to-pitch-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white text-xs font-black">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-ink-800 hidden sm:block max-w-[96px] truncate">
                    {user.name?.split(' ')[0] || 'User'}
                  </span>
                  <FiChevronDown className={`text-xs text-ink-400 transition-transform duration-200 flex-shrink-0 ${dropOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden bg-white border border-ink-200 shadow-2xl"
                      style={{ zIndex: 9999 }}>
                      <div className="px-4 py-4 bg-gradient-to-br from-pitch-700 to-pitch-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-black">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate">{user.name || 'User'}</p>
                            <span className="text-xs text-pitch-300 font-medium">
                              {user.role === 'owner' ? 'Turf Owner' : 'Player'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        {navLinks.map(l => (
                          <Link key={l.to} to={l.to} onClick={() => setDropOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                              isActive(l.to)
                                ? 'text-pitch-700 bg-pitch-50 font-semibold'
                                : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                            }`}>
                            <l.icon className={`flex-shrink-0 ${isActive(l.to) ? 'text-pitch-600' : 'text-ink-400'}`} />
                            {l.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-ink-100 py-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium">
                          <FiLogOut className="flex-shrink-0" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="text-sm font-semibold px-4 py-2 rounded-xl text-ink-700 hover:text-pitch-700 hover:bg-pitch-50 transition-all duration-200 hidden sm:block">
                  Login
                </Link>
                <Link to="/register"
                  className="text-sm font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-pitch-700 to-pitch-600 text-white hover:from-pitch-800 hover:to-pitch-700 transition-all duration-200 shadow-md shadow-pitch-700/30 whitespace-nowrap">
                  Sign Up Free
                </Link>
              </div>
            )}

            <button onClick={() => setOpen(o => !o)}
              className="lg:hidden p-2 rounded-xl text-ink-600 hover:bg-ink-100 transition-colors ml-1">
              {open ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-white border-t border-ink-100 shadow-xl">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to}
                  className={`flex items-center gap-3 py-3 px-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(l.to)
                      ? 'bg-pitch-700 text-white shadow-md'
                      : 'text-ink-700 hover:bg-ink-100'
                  }`}>
                  <l.icon className="flex-shrink-0" /> {l.label}
                </Link>
              ))}
              <a href="/#contact"
                className="flex items-center gap-3 py-3 px-3 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors">
                <FiPhone className="flex-shrink-0" /> Contact
              </a>
              {!user && (
                <div className="pt-3 border-t border-ink-100 flex flex-col gap-2">
                  <Link to="/login"
                    className="text-center py-2.5 rounded-xl text-sm font-semibold text-ink-700 border border-ink-200 hover:bg-ink-50 transition-colors">
                    Login
                  </Link>
                  <Link to="/register"
                    className="text-center py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-pitch-700 to-pitch-600 text-white shadow-md">
                    Sign Up Free
                  </Link>
                </div>
              )}
              {user && (
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 py-3 px-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                  <FiLogOut className="flex-shrink-0" /> Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
