import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';import {
  FiLogOut, FiGrid, FiCalendar, FiPlusCircle,
  FiChevronDown, FiCompass, FiPhone, FiBell, FiUsers, FiHome, FiUser, FiSearch
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { subscribeToPush } from '../utils/pushSubscribe';

// ─── Bell dropdown — defined OUTSIDE Navbar so it never remounts on re-render ───
function BellDropdown({ notifications, unreadCount, bellOpen, setBellOpen, markAllRead, pushEnabled, onEnablePush, isMobile }) {
  const ref = useRef(null);

  // Close on outside click/touch — covers both desktop and mobile
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [setBellOpen]);

  const toggle = (e) => {
    e.stopPropagation();
    setBellOpen(prev => {
      if (!prev) markAllRead();
      return !prev;
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onTouchStart={e => e.stopPropagation()}
        onClick={toggle}
        className={`relative rounded-xl flex items-center justify-center text-ink-500 hover:text-pitch-700 hover:bg-ink-100 transition-colors ${
          isMobile ? 'w-9 h-9' : 'p-2'
        }`}
      >
        <FiBell className={isMobile ? 'text-lg' : 'text-xl'} />
        {unreadCount > 0 && (
          <span className={`absolute bg-red-500 text-white font-black rounded-full flex items-center justify-center ${
            isMobile
              ? 'top-1 right-1 w-3.5 h-3.5 text-[9px]'
              : '-top-0.5 -right-0.5 w-4 h-4 text-[10px]'
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {bellOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`${isMobile ? 'fixed top-16 right-3' : 'absolute right-0 mt-2'} rounded-2xl overflow-hidden bg-white border border-ink-200 shadow-2xl`}
            style={{
              zIndex: 9999,
              width: 'min(320px, calc(100vw - 24px))',
            }}
          >
            <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
              <span className="font-bold text-ink-900 text-sm">Notifications</span>
              {notifications.length > 0 && (
                <button onClick={markAllRead} className="text-xs text-pitch-700 font-semibold hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            {!pushEnabled && 'Notification' in window && Notification.permission !== 'denied' && (
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
                <span className="text-lg">🔔</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-800">Enable push notifications</p>
                  <p className="text-xs text-amber-600">Get notified instantly on your device</p>
                </div>
                <button
                  onClick={onEnablePush}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors active:scale-95"
                >
                  Enable
                </button>
              </div>
            )}

            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0
                ? <p className="text-center text-ink-400 text-sm py-8">No notifications yet</p>
                : notifications.map(n => (
                  <div key={n._id} className={`px-4 py-3 border-b border-ink-50 text-sm ${n.isRead ? 'text-ink-500' : 'text-ink-900 bg-pitch-50'}`}>
                    <p className={!n.isRead ? 'font-semibold' : ''}>{n.message}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  const dropRef = useRef(null);

  useEffect(() => {
    if ('Notification' in window) setPushEnabled(Notification.permission === 'granted');
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try { const res = await api.get('/notifications'); setNotifications(res.data); } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    } catch {}
  };

  const handleEnablePush = async () => {
    await subscribeToPush();
    setPushEnabled(Notification.permission === 'granted');
  };

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setDropOpen(false); setBellOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const bellProps = { notifications, unreadCount, bellOpen, setBellOpen, markAllRead, pushEnabled, onEnablePush: handleEnablePush };

  const navLinks = user?.role === 'owner'
    ? [
        { to: '/owner/dashboard', label: 'Dashboard', icon: FiGrid },
        { to: '/owner/add-turf', label: 'Add Turf', icon: FiPlusCircle },
      ]
    : [
        { to: '/turfs', label: 'Find Turfs', icon: FiGrid },
        { to: '/explore', label: 'Explore', icon: FiCompass },
        { to: '/matches', label: 'Find Players', icon: FiUsers },
        ...(user ? [{ to: '/bookings', label: 'My Bookings', icon: FiCalendar }] : []),
      ];

  const bottomTabs = user?.role === 'owner'
    ? [
        { to: '/', label: 'Home', icon: FiHome },
        { to: '/owner/dashboard', label: 'Dashboard', icon: FiGrid },
        { to: '/owner/add-turf', label: 'Add Turf', icon: FiPlusCircle },
      ]
    : [
        { to: '/', label: 'Home', icon: FiHome },
        { to: '/turfs', label: 'Turfs', icon: FiGrid },
        { to: '/matches', label: 'Players', icon: FiUsers },
        { to: '/explore', label: 'Explore', icon: FiCompass },
        ...(user ? [{ to: '/bookings', label: 'Bookings', icon: FiCalendar }] : [{ to: '/login', label: 'Login', icon: FiUser }]),
      ];

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* ════════════════════════════════════════
          DESKTOP navbar (lg+)
      ════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 hidden lg:block ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/5 border-b border-ink-100' : 'bg-white border-b border-ink-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-9 h-9 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="group-hover:rotate-12 transition-transform duration-300">
                  <circle cx="18" cy="18" r="16" fill="url(#ballGrad)" />
                  <path d="M10 10 Q18 16 26 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                  <path d="M10 26 Q18 20 26 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
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

            {/* Nav links */}
            <div className="flex items-center gap-1">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(l.to) ? 'bg-pitch-700 text-white shadow-md shadow-pitch-700/30' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                  }`}>
                  <l.icon className="text-sm flex-shrink-0" />{l.label}
                </Link>
              ))}
              <a href="/#contact" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-all duration-200">
                <FiPhone className="text-sm flex-shrink-0" />Contact
              </a>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {user && <BellDropdown {...bellProps} isMobile={false} />}
              {user ? (
                <div className="relative" ref={dropRef}>
                  <button onClick={() => setDropOpen(d => !d)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-ink-200 hover:border-pitch-400 hover:shadow-md bg-white transition-all duration-200">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pitch-600 to-pitch-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white text-xs font-black">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                    </div>
                    <span className="text-sm font-semibold text-ink-800 max-w-[96px] truncate">{user.name?.split(' ')[0] || 'User'}</span>
                    <FiChevronDown className={`text-xs text-ink-400 transition-transform duration-200 flex-shrink-0 ${dropOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {dropOpen && (
                      <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden bg-white border border-ink-200 shadow-2xl" style={{ zIndex: 9999 }}>
                        <div className="px-4 py-4 bg-gradient-to-br from-pitch-700 to-pitch-900">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-black">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-white truncate">{user.name || 'User'}</p>
                              <span className="text-xs text-pitch-300 font-medium">{user.role === 'owner' ? 'Turf Owner' : 'Player'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="py-1">
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
                  <Link to="/login" className="text-sm font-semibold px-4 py-2 rounded-xl text-ink-700 hover:text-pitch-700 hover:bg-pitch-50 transition-all duration-200">Login</Link>
                  <Link to="/register" className="text-sm font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-pitch-700 to-pitch-600 text-white hover:from-pitch-800 hover:to-pitch-700 transition-all duration-200 shadow-md shadow-pitch-700/30 whitespace-nowrap">Sign Up Free</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          MOBILE top header (< lg)
      ════════════════════════════════════════ */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-ink-100 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14 gap-3">

          {/* Left: Logo icon + wordmark */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="16" fill="url(#mballGrad)" />
                <path d="M10 10 Q18 16 26 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                <path d="M10 26 Q18 20 26 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                <rect x="22" y="4" width="5" height="14" rx="2.5" fill="#D97706" />
                <rect x="23.5" y="17" width="2" height="5" rx="1" fill="#92400E" />
                <defs>
                  <radialGradient id="mballGrad" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="#4CAF50" />
                    <stop offset="100%" stopColor="#1B5E20" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
            <div>
              <p className="text-ink-900 font-black text-base leading-tight">
                Pitch<span className="text-pitch-700">Up</span>
              </p>
              <p className="text-ink-400 text-[10px] leading-tight">Book · Play · Connect</p>
            </div>
          </Link>

          {/* Right: search + bell + avatar */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => navigate('/turfs')}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-500 hover:text-pitch-700 hover:bg-ink-100 transition-colors">
              <FiSearch className="text-lg" />
            </button>

            {user && <BellDropdown {...bellProps} isMobile={true} />}

            {/* Avatar dropdown */}
            {user ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(d => !d)}
                  className="w-9 h-9 rounded-xl bg-pitch-700 flex items-center justify-center flex-shrink-0 hover:bg-pitch-800 transition-colors">
                  <span className="text-white text-sm font-black">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                </button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl overflow-hidden bg-white border border-ink-200 shadow-2xl"
                      style={{ zIndex: 9999 }}>
                      <div className="px-4 py-3 bg-gradient-to-br from-pitch-700 to-pitch-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-black">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{user.name || 'User'}</p>
                          <p className="text-[11px] text-pitch-300">{user.role === 'owner' ? 'Turf Owner' : 'Player'}</p>
                        </div>
                      </div>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium">
                        <FiLogOut className="flex-shrink-0" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login"
                className="px-3 py-1.5 rounded-xl bg-pitch-700 text-white text-xs font-black hover:bg-pitch-800 transition-colors shadow-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════
          MOBILE Bottom Tab Bar
      ════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-ink-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-stretch">
          {bottomTabs.map((tab) => {
            const active = isActive(tab.to);
            return (
              <Link key={tab.to} to={tab.to}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative"
                style={{ minHeight: 56 }}>
                {active && (
                  <motion.div layoutId="bottomTabIndicator"
                    className="absolute top-0 inset-x-0 mx-auto w-8 h-0.5 rounded-full bg-pitch-700"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                )}
                <tab.icon className={`text-xl transition-colors ${active ? 'text-pitch-700' : 'text-ink-400'}`} />
                <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-pitch-700' : 'text-ink-400'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
