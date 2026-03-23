import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiLogOut, FiGrid, FiCalendar, FiPlusCircle,
  FiChevronDown, FiCompass, FiPhone, FiBell, FiUsers, FiHome, FiUser
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { subscribeToPush } from '../utils/pushSubscribe';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);
  const dropRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (user?.role === 'owner') {
      fetchNotifications();
      subscribeToPush();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    } catch {}
  };

  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
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

  // Bottom tab bar items for mobile
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
      {/* ── Top Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/5 border-b border-ink-100'
          : 'bg-white border-b border-ink-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-9 h-9 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-200 flex-shrink-0 bg-white border border-ink-100 shadow-sm">
                <svg width="36" height="36" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Pitch */}
                  <polygon points="180,420 332,420 290,180 222,180" fill="#2E7D32"/>
                  <line x1="210" y1="230" x2="302" y2="230" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.9"/>
                  <line x1="196" y1="380" x2="316" y2="380" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.9"/>
                  {/* Stumps */}
                  <rect x="238" y="188" width="10" height="52" rx="5" fill="white"/>
                  <rect x="251" y="188" width="10" height="52" rx="5" fill="white"/>
                  <rect x="264" y="188" width="10" height="52" rx="5" fill="white"/>
                  <rect x="235" y="186" width="18" height="6" rx="3" fill="#FCD34D"/>
                  <rect x="259" y="186" width="18" height="6" rx="3" fill="#FCD34D"/>
                  {/* Outfield */}
                  <polygon points="60,440 180,420 222,180 130,100" fill="#388E3C"/>
                  <polygon points="452,440 332,420 290,180 382,100" fill="#388E3C"/>
                  {/* Bat */}
                  <rect x="108" y="72" width="52" height="310" rx="26" fill="#2E7D32"/>
                  <rect x="122" y="370" width="24" height="72" rx="12" fill="#1B5E20"/>
                  <rect x="108" y="72" width="14" height="310" rx="7" fill="#4CAF50" opacity="0.5"/>
                  {/* Trail */}
                  <ellipse cx="260" cy="195" rx="90" ry="18" fill="url(#nt)" transform="rotate(-38 260 195)" opacity="0.7"/>
                  {/* Ball */}
                  <circle cx="360" cy="108" r="58" fill="url(#nb)"/>
                  <ellipse cx="342" cy="90" rx="16" ry="10" fill="white" opacity="0.3" transform="rotate(-30 342 90)"/>
                  <path d="M330 88 Q348 108 330 128" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6"/>
                  <path d="M390 88 Q372 108 390 128" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6"/>
                  <defs>
                    <linearGradient id="nt" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="white" stopOpacity="0"/>
                      <stop offset="100%" stopColor="#A5D6A7" stopOpacity="0.9"/>
                    </linearGradient>
                    <radialGradient id="nb" cx="38%" cy="35%" r="62%">
                      <stop offset="0%" stopColor="#FF7043"/>
                      <stop offset="100%" stopColor="#B71C1C"/>
                    </radialGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight text-ink-900">
                Pitch<span className="text-pitch-700">Up</span>
              </span>
            </Link>

            {/* Desktop Nav links */}
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
              {/* Bell — owner only */}
              {user?.role === 'owner' && (
                <div className="relative" ref={bellRef}>
                  <button onClick={() => { setBellOpen(o => !o); if (!bellOpen) markAllRead(); }}
                    className="relative p-2 rounded-xl text-ink-600 hover:bg-ink-100 transition-colors">
                    <FiBell className="text-xl" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
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
                        className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden bg-white border border-ink-200 shadow-2xl"
                        style={{ zIndex: 9999 }}>
                        <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
                          <span className="font-bold text-ink-900 text-sm">Notifications</span>
                          {notifications.length > 0 && (
                            <button onClick={markAllRead} className="text-xs text-pitch-700 font-semibold hover:underline">
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="text-center text-ink-400 text-sm py-8">No notifications yet</p>
                          ) : notifications.map(n => (
                            <div key={n._id}
                              className={`px-4 py-3 border-b border-ink-50 text-sm ${n.isRead ? 'text-ink-500' : 'text-ink-900 bg-pitch-50'}`}>
                              <p className={`${!n.isRead ? 'font-semibold' : ''}`}>{n.message}</p>
                              <p className="text-xs text-ink-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Profile dropdown — name + sign out only */}
              {user ? (
                <div className="relative" ref={dropRef}>
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
                        className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden bg-white border border-ink-200 shadow-2xl"
                        style={{ zIndex: 9999 }}>
                        {/* Profile info only */}
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
                <div className="hidden lg:flex items-center gap-2">
                  <Link to="/login"
                    className="text-sm font-semibold px-4 py-2 rounded-xl text-ink-700 hover:text-pitch-700 hover:bg-pitch-50 transition-all duration-200">
                    Login
                  </Link>
                  <Link to="/register"
                    className="text-sm font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-pitch-700 to-pitch-600 text-white hover:from-pitch-800 hover:to-pitch-700 transition-all duration-200 shadow-md shadow-pitch-700/30 whitespace-nowrap">
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Tab Bar (BigBasket style) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-ink-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-stretch">
          {bottomTabs.map((tab) => {
            const active = isActive(tab.to);
            return (
              <Link key={tab.to} to={tab.to}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors"
                style={{ minHeight: 56 }}>
                {active && (
                  <motion.div
                    layoutId="bottomTabIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-pitch-700"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <tab.icon className={`text-xl transition-colors ${active ? 'text-pitch-700' : 'text-ink-400'}`} />
                <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-pitch-700' : 'text-ink-400'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* Sign out tab for logged-in mobile users */}
          {user && (
            <button
              onClick={handleLogout}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-red-400 transition-colors hover:text-red-500"
              style={{ minHeight: 56 }}>
              <FiLogOut className="text-xl" />
              <span className="text-[10px] font-semibold">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
