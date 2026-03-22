import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMapPin, FiArrowRight, FiZap, FiShield, FiStar,
  FiPhone, FiMail, FiMessageCircle, FiCheck, FiTrendingUp, FiChevronDown
} from 'react-icons/fi';
import { fadeUp, staggerContainer, scaleIn } from '../animations/variants';
import { CITIES } from '../constants';
import { EXPLORE_TURFS } from '../data/exploreTurfs';
export { CITIES };

const PREVIEW_TURFS = EXPLORE_TURFS.slice(0, 3);
const PREVIEW_IMGS = [
  'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqqlp3D822p-bsCb-pHWsYyBzGlpJKOVgTuYs6QVGwbifdkXYRFWCtvXqT9K2PkYfboRxVpUufwl2Ac6C1uTOdZd1d2PU8pBMkuCUt0E5vS98c2ZCjch0yNiApJ7vPLj1pbosfGwOmJwLie=s680-w680-h510-rw',
  'https://lh3.googleusercontent.com/gps-cs-s/AHVAweojq9dVG9iIHItiyPNNk9M9kSFwJtHksIXQGn1LKhWpIy3RK1bxKL1KB1PUVEXeYoQNlw96hxZBpHk_y7GCr4ldYG1AQbWXdVT6ER_uYcoiqda8z50TgJjkMba-UOI1jsor7COYBw=w141-h235-n-k-no-nu',
  'https://lh3.googleusercontent.com/p/AF1QipPcA45J2t8NeSviF6X3cCHzf797XxjefeBjSAmq=w243-h174-n-k-no-nu',
];

import heroBg from '../assets/hero.jpg';
// Box cricket turf background
const HERO_BG = heroBg;

const FAQS = [
  { q: 'How do I book a turf on PitchUp?', a: 'Simply search for a turf by name or city, pick your preferred date and time slot, and confirm your booking. No calls needed — the whole process takes under 60 seconds.' },
  { q: 'Is there any advance payment required?', a: 'No advance payment is required to book a slot. You pay directly at the turf when you arrive.' },
  { q: 'Can I cancel or reschedule my booking?', a: 'Yes, you can cancel or reschedule your booking from the "My Bookings" section. Please check the turf\'s cancellation policy before booking.' },
  { q: 'How do I list my turf on PitchUp?', a: 'Register as a Turf Owner, fill in your turf details, upload photos, and set your pricing. Your listing goes live immediately after submission.' },
  { q: 'Are the turfs verified?', a: 'Yes, every turf listed on PitchUp is physically verified by our team for quality, safety, and accuracy of information.' },
  { q: 'Which cities are currently supported?', a: 'We currently support Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, Ahmedabad, and Surat — with more cities being added regularly.' },
];

const FEATURES = [
  { icon: FiZap, title: 'Instant Booking', desc: 'Reserve your slot in under 60 seconds. No calls, no waiting.', gradient: 'from-amber-400 to-orange-500', light: 'bg-amber-50', border: 'border-amber-100' },
  { icon: FiShield, title: 'Verified Turfs', desc: 'Every turf is physically verified and quality-checked.', gradient: 'from-blue-400 to-blue-600', light: 'bg-blue-50', border: 'border-blue-100' },
  { icon: FiStar, title: 'Top Rated', desc: 'Honest reviews from real players. Find the best near you.', gradient: 'from-purple-400 to-purple-600', light: 'bg-purple-50', border: 'border-purple-100' },
  { icon: FiTrendingUp, title: 'Best Prices', desc: 'Compare prices across turfs and always get the best deal.', gradient: 'from-pitch-500 to-pitch-700', light: 'bg-pitch-50', border: 'border-pitch-100' },
];

const STEPS = [
  { title: 'Search', desc: 'Find turfs in your city by name, area or price', emoji: '🔍', color: 'from-blue-500 to-blue-700' },
  { title: 'Pick a Slot', desc: 'Choose your preferred date and available time slot', emoji: '📅', color: 'from-pitch-500 to-pitch-700' },
  { title: 'Play!', desc: 'Confirm your booking and head to the turf', emoji: '🏏', color: 'from-amber-500 to-orange-600' },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [faqOpen, setFaqOpen] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    navigate(`/turfs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-ink-50">

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden pt-24 pb-0">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Cricket turf" className="w-full h-full object-cover object-center scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/75" />
          <div className="absolute inset-0 bg-pitch-900/20" />
        </div>

        {/* Background decoration (same as before) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating cricket ball */}
          <motion.div
            animate={{ y: [0, -18, 0], rotate: [0, 360] }}
            transition={{ y: { repeat: Infinity, duration: 4, ease: 'easeInOut' }, rotate: { repeat: Infinity, duration: 8, ease: 'linear' } }}
            className="absolute top-16 right-[8%] opacity-30">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="34" fill="url(#heroball1)" />
              <path d="M20 20 Q36 30 52 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M20 52 Q36 42 52 52" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <defs>
                <radialGradient id="heroball1" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#66BB6A" />
                  <stop offset="100%" stopColor="#1B5E20" />
                </radialGradient>
              </defs>
            </svg>
          </motion.div>
          {/* Floating bat */}
          <motion.div
            animate={{ y: [0, 14, 0], rotate: [-15, -5, -15] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            className="absolute top-24 left-[6%] opacity-25">
            <svg width="28" height="80" viewBox="0 0 28 80" fill="none">
              <rect x="6" y="0" width="16" height="52" rx="8" fill="#D97706"/>
              <rect x="10" y="52" width="8" height="20" rx="4" fill="#92400E"/>
            </svg>
          </motion.div>
          {/* Small spinning ball */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, -360] }}
            transition={{ y: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' }, rotate: { repeat: Infinity, duration: 6, ease: 'linear' } }}
            className="absolute bottom-32 left-[12%] opacity-20">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="20" fill="url(#heroball2)" />
              <path d="M12 12 Q22 18 32 12" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M12 32 Q22 26 32 32" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <defs>
                <radialGradient id="heroball2" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#A5D6A7" />
                  <stop offset="100%" stopColor="#2E7D32" />
                </radialGradient>
              </defs>
            </svg>
          </motion.div>
          {/* Wicket stumps */}
          <motion.div
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute top-10 left-[20%]">
            <svg width="36" height="60" viewBox="0 0 36 60" fill="none">
              <rect x="2" y="10" width="5" height="44" rx="2.5" fill="#4CAF50"/>
              <rect x="15.5" y="10" width="5" height="44" rx="2.5" fill="#4CAF50"/>
              <rect x="29" y="10" width="5" height="44" rx="2.5" fill="#4CAF50"/>
              <rect x="0" y="6" width="16" height="6" rx="3" fill="#66BB6A"/>
              <rect x="20" y="6" width="16" height="6" rx="3" fill="#66BB6A"/>
            </svg>
          </motion.div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-7">

            {/* Badge */}
            <motion.div variants={fadeUp} className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-pitch-700 to-pitch-600 text-white shadow-lg shadow-pitch-700/30">
                <span>🏏</span>
                India's #1 Box Cricket Booking Platform
                <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.0] tracking-tight">
                <span className="text-white">Find Your</span>
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-pitch-400 via-pitch-300 to-pitch-400 bg-clip-text text-transparent">
                    Cricket Turf
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 300 8" fill="none">
                    <path d="M0 6 Q75 0 150 4 Q225 8 300 2" stroke="#66BB6A" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7"/>
                  </svg>
                </span>
                <br />
                <span className="text-white/80">Book It Now.</span>
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
              Discover verified box cricket turfs near you and book your slot instantly — no calls, no hassle.
            </motion.p>

            {/* Trust pills */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2.5">
              {['Real-time availability', 'Instant confirmation', 'No advance payment'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-sm text-white px-4 py-2 rounded-full bg-white/10 border border-white/25 font-semibold backdrop-blur-sm">
                  <FiCheck className="text-pitch-400 text-xs" /> {t}
                </span>
              ))}
            </motion.div>

            {/* Search bar */}
            <motion.form variants={fadeUp} onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/15">
                  <FiSearch className="text-white/60 flex-shrink-0 text-base" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search turf name or area..."
                    className="bg-transparent flex-1 outline-none text-sm text-white placeholder-white/50 font-medium"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/15 sm:w-44">
                  <FiMapPin className="text-pitch-400 flex-shrink-0 text-sm" />
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="bg-transparent flex-1 outline-none text-sm text-white appearance-none cursor-pointer font-medium">
                    <option value="" className="text-ink-900 bg-white">All Cities</option>
                    {CITIES.map(c => <option key={c} value={c} className="text-ink-900 bg-white">{c}</option>)}
                  </select>
                </div>
                <button type="submit"
                  className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-pitch-700 to-pitch-600 text-white hover:from-pitch-800 hover:to-pitch-700 transition-all duration-200 shadow-lg shadow-pitch-700/30 active:scale-95">
                  <FiSearch className="text-sm" /> Search
                </button>
              </div>
            </motion.form>

            {/* City chips */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 pb-2">
              {CITIES.slice(0, 8).map(c => (
                <button key={c} onClick={() => navigate(`/turfs?city=${c}`)}
                  className="text-xs text-white/80 px-4 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-pitch-700 hover:text-white hover:border-pitch-600 transition-all duration-200 font-semibold backdrop-blur-sm">
                  {c}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative z-10 flex flex-col items-center gap-2 text-white/50 text-xs mt-10 pb-10">
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-pitch-400 rounded-full" />
          </div>
          <span>Scroll</span>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 bg-ink-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="text-center mb-16">
            <motion.div variants={fadeUp}>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-pitch-100 text-pitch-700 border border-pitch-200 mb-4 tracking-wider uppercase">
                Why PitchUp
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight text-ink-900 mb-3">
              Everything you need to<br />
              <span className="text-pitch-700">book the perfect turf</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-ink-500 text-lg max-w-lg mx-auto">Simple, fast and reliable booking experience</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                className={`group relative rounded-2xl p-6 border-2 ${f.border} ${f.light} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-8 translate-x-8"
                  style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="text-white text-xl" />
                </div>
                <h3 className="font-bold text-base mb-2 text-ink-900">{f.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #2E7D32 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Ambient glow blobs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full opacity-[0.06] blur-3xl bg-pitch-500 pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 rounded-full opacity-[0.06] blur-3xl bg-blue-500 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-pitch-100 text-pitch-700 border border-pitch-200 mb-4 tracking-wider uppercase">
                How It Works
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-ink-900">
                Book in <span className="text-pitch-700">3 easy steps</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Animated connector line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.6, ease: 'easeInOut' }}
                className="hidden md:block absolute top-12 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-0.5 origin-left"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg, #4CAF50 0, #4CAF50 8px, transparent 8px, transparent 16px)' }}
              />

              {STEPS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.18, ease: 'easeOut' }}
                  whileHover={{ y: -6 }}
                  className="flex flex-col items-center text-center group cursor-default">
                  <div className="relative mb-6">
                    {/* Pulse ring */}
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4, ease: 'easeInOut' }}
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${s.color} opacity-30`}
                    />
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: [0, -4, 4, 0] }}
                      transition={{ duration: 0.4 }}
                      className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow duration-300`}>
                      <span className="text-4xl">{s.emoji}</span>
                    </motion.div>
                    {/* Step number badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 300, delay: 0.3 + i * 0.18 }}
                      className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border-2 border-pitch-300 flex items-center justify-center shadow-md">
                      <span className="text-pitch-700 text-sm font-black">{i + 1}</span>
                    </motion.div>
                  </div>
                  <h3 className="font-black text-xl mb-2 text-ink-900 group-hover:text-pitch-700 transition-colors duration-200">{s.title}</h3>
                  <p className="text-sm text-ink-500 leading-relaxed max-w-xs">{s.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-center mt-12">
              <button onClick={() => navigate('/turfs')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-pitch-700 to-pitch-600 text-white hover:from-pitch-800 hover:to-pitch-700 transition-all duration-200 shadow-xl shadow-pitch-700/30 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95">
                Start Booking Now <FiArrowRight />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── EXPLORE PREVIEW ── */}
      <section className="py-24 px-4 bg-ink-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-pitch-100 text-pitch-700 border border-pitch-200 mb-4 tracking-wider uppercase">
                  Explore Venues
                </span>
                <h2 className="text-4xl font-black tracking-tight text-ink-900">
                  Turfs near you,<br />
                  <span className="text-pitch-700">not yet on PitchUp</span>
                </h2>
                <p className="text-ink-500 mt-2 max-w-md">Real cricket venues across India. Contact them directly or invite them to join.</p>
              </div>
              <a href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 border-pitch-700 text-pitch-700 hover:bg-pitch-700 hover:text-white transition-all duration-200 flex-shrink-0 self-start sm:self-auto">
                View All <FiArrowRight className="text-xs" />
              </a>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PREVIEW_TURFS.map((t, i) => (
                <motion.a key={t.id} variants={fadeUp} href={`/explore/${t.id}`}
                  className="group rounded-2xl overflow-hidden bg-white border border-ink-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 block">
                  <div className="relative h-52 overflow-hidden">
                    <img src={PREVIEW_IMGS[i]} alt={t.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md">
                      Not on PitchUp
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/95 text-ink-800 font-bold shadow-md">
                      <FiStar className="text-amber-500 text-xs" /> {t.rating}
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="text-2xl font-black text-white">&#8377;{t.pricePerHour}</span>
                      <span className="text-xs text-gray-300 ml-1">/hr</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-base text-ink-900 truncate mb-1.5">{t.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-4">
                      <FiMapPin className="text-pitch-600 flex-shrink-0" />
                      <span className="truncate">{t.city} — {t.location.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pitch-700 bg-pitch-50 px-3 py-1.5 rounded-full border border-pitch-200">View &amp; Contact</span>
                      <div className="w-8 h-8 rounded-full bg-pitch-700 flex items-center justify-center group-hover:bg-pitch-800 transition-colors shadow-md">
                        <FiArrowRight className="text-white text-xs" />
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── OWNER CTA ── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-700" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #66BB6A, transparent)' }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}>
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6 animate-float backdrop-blur-sm">
                <span className="text-4xl">🏏</span>
              </div>
              <p className="text-pitch-300 text-sm font-bold tracking-widest uppercase mb-4">For Turf Owners</p>
              <h2 className="text-4xl md:text-6xl font-black mb-5 text-white leading-tight">
                Own a Turf?<br />
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  List it for free.
                </span>
              </h2>
              <p className="text-pitch-300 text-lg max-w-lg mx-auto mb-6 leading-relaxed">
                Reach thousands of players actively looking for turfs in your city.
              </p>
              <div className="flex flex-wrap justify-center gap-5 mb-10 text-sm text-pitch-300">
                {['Free registration', 'Easy management', 'Instant bookings', 'Real-time analytics'].map(t => (
                  <span key={t} className="flex items-center gap-2 font-medium">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="text-amber-400 text-xs" />
                    </span>
                    {t}
                  </span>
                ))}
              </div>
              <a href="/register"
                className="inline-flex items-center gap-2 text-base px-10 py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-2xl shadow-amber-500/30 hover:-translate-y-0.5 active:scale-95">
                Register as Owner <FiArrowRight />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      {/* <section className="py-24 px-4 bg-ink-50">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-pitch-100 text-pitch-700 border border-pitch-200 mb-4 tracking-wider uppercase">
                FAQ
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-ink-900 mb-3">
                Got <span className="text-pitch-700">Questions?</span>
              </h2>
              <p className="text-ink-500 text-lg">Everything you need to know about finding and booking turfs on PitchUp.</p>
            </motion.div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}
                  className="rounded-2xl border border-ink-200 bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-ink-50 transition-colors">
                    <span className="font-semibold text-ink-900 text-sm md:text-base">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: faqOpen === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0">
                      <FiChevronDown className={`text-lg transition-colors ${faqOpen === i ? 'text-pitch-700' : 'text-ink-400'}`} />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {faqOpen === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}>
                        <div className="px-6 pb-5 text-sm text-ink-500 leading-relaxed border-t border-ink-100 pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section> */}

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-pitch-100 text-pitch-700 border border-pitch-200 mb-4 tracking-wider uppercase">
                Support
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-ink-900 mb-3">
                Get in <span className="text-pitch-700">Touch</span>
              </h2>
              <p className="text-ink-500 text-lg">We're here to help, any time.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: FiPhone, title: 'Call Us', value: '+91 98751 23271', sub: 'Mon–Sat, 9am–8pm', href: 'tel:+919875123271', gradient: 'from-blue-500 to-blue-700', light: 'bg-blue-50', border: 'border-blue-100' },
                { icon: FiMessageCircle, title: 'WhatsApp', value: '+91 98751 23271', sub: 'Quick replies guaranteed', href: 'https://wa.me/919875123271', gradient: 'from-pitch-500 to-pitch-700', light: 'bg-pitch-50', border: 'border-pitch-100' },
                { icon: FiMail, title: 'Email Us', value: 'support@pitchup.in', sub: 'Reply within 24 hours', href: 'mailto:support@pitchup.in', gradient: 'from-purple-500 to-purple-700', light: 'bg-purple-50', border: 'border-purple-100' },
              ].map((c, i) => (
                <motion.a key={i} variants={fadeUp} href={c.href} target="_blank" rel="noreferrer"
                  className={`group rounded-2xl p-6 text-center border-2 ${c.border} ${c.light} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <c.icon className="text-white text-xl" />
                  </div>
                  <h3 className="font-bold text-base mb-1 text-ink-900">{c.title}</h3>
                  <p className="text-sm font-semibold mb-1 text-ink-700">{c.value}</p>
                  <p className="text-xs text-ink-400">{c.sub}</p>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
