import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSun, FiMoon, FiUser, FiLogOut, FiPhone } from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropOpen(false);
  };

  const navLinks = user?.role === 'owner'
    ? [
        { to: '/owner/dashboard', label: 'Dashboard' },
        { to: '/owner/add-turf', label: 'Add Turf' },
      ]
    : [
        { to: '/turfs', label: 'Find Turfs' },
        { to: '/bookings', label: 'My Bookings' },
      ];

  const textColor = dark ? 'text-gray-300' : 'text-gray-700';
  const activeColor = 'text-neon';
  const bgClass = dark ? 'bg-black/40 border-white/10' : 'bg-white/90 border-gray-200 shadow-sm';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <GiCricketBat className="text-neon text-2xl group-hover:rotate-12 transition-transform" />
            <span className="text-xl font-black tracking-tight">
              Box<span className="text-neon">Book</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`text-sm font-medium transition-colors hover:text-neon ${location.pathname === l.to ? activeColor : textColor}`}>
                {l.label}
              </Link>
            ))}
            <a href="/#contact"
              className={`text-sm font-medium transition-colors hover:text-neon flex items-center gap-1 ${textColor}`}>
              <FiPhone className="text-xs" /> Contact
            </a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* <button onClick={toggle} className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
              {dark ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-blue-500" />}
            </button> */}

            {user ? (
              <div className="relative">
                <button onClick={() => setDropOpen(d => !d)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${dark ? 'bg-white/5 border-white/10 hover:border-neon/50' : 'bg-gray-100 border-gray-200 hover:border-neon/50'}`}>
                  <div className="w-7 h-7 rounded-full bg-neon/20 flex items-center justify-center">
                    <FiUser className="text-neon text-sm" />
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${dark ? 'text-white' : 'text-gray-800'}`}>
                    {user.name?.split(' ')[0] || 'User'}
                  </span>
                </button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className={`absolute right-0 mt-2 w-52 rounded-xl border overflow-hidden shadow-xl z-50 ${dark ? 'bg-dark-700 border-white/10' : 'bg-white border-gray-200'}`}>
                      <div className={`px-4 py-3 border-b ${dark ? 'border-white/10' : 'border-gray-100'}`}>
                        <p className="text-sm font-semibold">{user.name || 'User'}</p>
                        <p className={`text-xs capitalize ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{user.role === 'owner' ? 'Turf Owner' : 'Player'}</p>
                      </div>
                      {navLinks.map(l => (
                        <Link key={l.to} to={l.to} onClick={() => setDropOpen(false)}
                          className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors ${dark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                          {l.label}
                        </Link>
                      ))}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <FiLogOut /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className={`text-sm font-medium transition-colors hover:text-neon hidden sm:block ${textColor}`}>Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setOpen(o => !o)} className={`md:hidden p-2 rounded-lg transition-colors ${dark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
              {open ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className={`md:hidden border-t overflow-hidden ${dark ? 'bg-dark-800 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                  className={`block py-2 text-sm font-medium hover:text-neon transition-colors ${textColor}`}>{l.label}</Link>
              ))}
              <a href="/#contact" onClick={() => setOpen(false)}
                className={`block py-2 text-sm font-medium hover:text-neon transition-colors ${textColor}`}>
                Contact
              </a>
              {!user && (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className={`block py-2 text-sm ${textColor}`}>Login</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="block btn-primary text-center text-sm">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
