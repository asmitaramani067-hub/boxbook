import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiX } from 'react-icons/fi';

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or installed
    if (localStorage.getItem('pwa-dismissed')) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      // Show banner after 3 seconds
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-dismissed', '1');
  };

  if (installed || !show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-4 left-4 right-4 z-[9999] max-w-sm mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-ink-100 p-4 flex items-center gap-3">
          {/* App icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pitch-600 to-pitch-800 flex items-center justify-center flex-shrink-0 shadow-md">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" fill="white" opacity="0.9"/>
              <rect x="13" y="3" width="8" height="8" rx="2" fill="white" opacity="0.6"/>
              <rect x="3" y="13" width="8" height="8" rx="2" fill="white" opacity="0.6"/>
              <rect x="13" y="13" width="8" height="8" rx="2" fill="white" opacity="0.9"/>
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink-900">Install PitchUp App</p>
            <p className="text-xs text-ink-500">Add to home screen for quick access</p>
          </div>

          {/* Install button */}
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pitch-700 to-pitch-600 text-white shadow-md hover:from-pitch-800 hover:to-pitch-700 transition-all duration-200 flex-shrink-0 active:scale-95">
            <FiDownload className="text-xs" /> Install
          </button>

          {/* Close */}
          <button onClick={handleDismiss}
            className="p-1 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors flex-shrink-0">
            <FiX className="text-sm" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
