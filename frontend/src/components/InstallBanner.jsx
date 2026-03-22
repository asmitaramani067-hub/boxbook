import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiX, FiShare } from 'react-icons/fi';

// Detect iOS Safari
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null);   // Android/Chrome prompt
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIos, setShowIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already dismissed or already installed as PWA
    if (localStorage.getItem('pwa-dismissed')) return;
    if (isInStandaloneMode()) return;

    // ── Android / Chrome ──
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setShowAndroid(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));

    // ── iOS Safari ──
    if (isIos()) {
      setTimeout(() => setShowIos(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setShowAndroid(false);
  };

  const dismiss = () => {
    setShowAndroid(false);
    setShowIos(false);
    localStorage.setItem('pwa-dismissed', '1');
  };

  if (installed) return null;

  return (
    <AnimatePresence>
      {/* ── Android / Chrome banner ── */}
      {showAndroid && (
        <motion.div key="android"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] max-w-sm mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-ink-100 p-4 flex items-center gap-3">
            <AppIcon />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink-900">Install PitchUp App</p>
              <p className="text-xs text-ink-500">Add to home screen for quick access</p>
            </div>
            <button onClick={handleInstall}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pitch-700 to-pitch-600 text-white shadow-md hover:from-pitch-800 hover:to-pitch-700 transition-all duration-200 flex-shrink-0 active:scale-95">
              <FiDownload className="text-xs" /> Install
            </button>
            <button onClick={dismiss}
              className="p-1 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors flex-shrink-0">
              <FiX className="text-sm" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── iOS Safari banner ── */}
      {showIos && (
        <motion.div key="ios"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] max-w-sm mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-ink-100 p-4">
            {/* Header row */}
            <div className="flex items-center gap-3 mb-3">
              <AppIcon />
              <div className="flex-1">
                <p className="text-sm font-bold text-ink-900">Install PitchUp</p>
                <p className="text-xs text-ink-500">Add to your iPhone home screen</p>
              </div>
              <button onClick={dismiss}
                className="p-1 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors">
                <FiX className="text-sm" />
              </button>
            </div>

            {/* iOS steps */}
            <div className="bg-ink-50 rounded-xl p-3 space-y-2.5">
              <Step n={1} icon={<FiShare className="text-blue-500 text-base flex-shrink-0" />}
                text={<>Tap the <span className="font-bold text-blue-500">Share</span> button at the bottom of Safari</>} />
              <Step n={2} icon={<span className="text-base flex-shrink-0">⬆️</span>}
                text={<>Scroll down and tap <span className="font-bold text-ink-900">"Add to Home Screen"</span></>} />
              <Step n={3} icon={<span className="text-base flex-shrink-0">✅</span>}
                text={<>Tap <span className="font-bold text-ink-900">"Add"</span> — done!</>} />
            </div>

            {/* Arrow pointing down to Safari share bar */}
            <div className="flex justify-center mt-2">
              <div className="flex flex-col items-center gap-0.5 text-ink-400">
                <span className="text-xs font-medium">Share button is here</span>
                <span className="text-lg">↓</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AppIcon() {
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pitch-600 to-pitch-800 flex items-center justify-center flex-shrink-0 shadow-md">
      <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
        <circle cx="16" cy="18" r="14" fill="url(#bnBall)" />
        <path d="M8 10 Q16 15 24 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
        <path d="M8 26 Q16 21 24 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
        <rect x="24" y="4" width="5" height="13" rx="2.5" fill="#D97706" />
        <rect x="25.5" y="16" width="2" height="5" rx="1" fill="#92400E" />
        <defs>
          <radialGradient id="bnBall" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor="#1B5E20" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function Step({ n, icon, text }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-5 h-5 rounded-full bg-pitch-700 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
        {n}
      </span>
      {icon}
      <p className="text-xs text-ink-600 leading-snug">{text}</p>
    </div>
  );
}
