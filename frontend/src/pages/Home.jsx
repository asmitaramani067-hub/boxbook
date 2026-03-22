import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch, FiMapPin, FiArrowRight, FiZap, FiShield, FiStar,
  FiPhone, FiMail, FiMessageCircle, FiCheck, FiTrendingUp
} from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';
import { MdSportsCricket } from 'react-icons/md';
import { fadeUp, staggerContainer, scaleIn } from '../animations/variants';
import { CITIES } from '../constants';
export { CITIES };

const FEATURES = [
  {
    icon: FiZap,
    title: 'Instant Booking',
    desc: 'Reserve your slot in under 60 seconds. No calls, no waiting.',
    color: 'from-yellow-500/20 to-orange-500/10',
    iconColor: 'text-yellow-400',
    border: 'hover:border-yellow-500/30',
  },
  {
    icon: FiShield,
    title: 'Verified Turfs',
    desc: 'Every turf is physically verified and quality-checked by our team.',
    color: 'from-blue-500/20 to-cyan-500/10',
    iconColor: 'text-blue-400',
    border: 'hover:border-blue-500/30',
  },
  {
    icon: FiStar,
    title: 'Top Rated',
    desc: 'Honest reviews from real players. Find the best turf near you.',
    color: 'from-purple-500/20 to-pink-500/10',
    iconColor: 'text-purple-400',
    border: 'hover:border-purple-500/30',
  },
  {
    icon: FiTrendingUp,
    title: 'Best Prices',
    desc: 'Compare prices across turfs and always get the best deal.',
    color: 'from-neon/20 to-emerald-500/10',
    iconColor: 'text-neon',
    border: 'hover:border-neon/30',
  },
];

const STEPS = [
  { num: '01', title: 'Search', desc: 'Find turfs in your city by name, area or price', icon: FiSearch },
  { num: '02', title: 'Pick a Slot', desc: 'Choose your preferred date and available time slot', icon: FiMapPin },
  { num: '03', title: 'Play!', desc: 'Confirm your booking and head to the turf', icon: MdSportsCricket },
];



export default function Home() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    navigate(`/turfs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-dark-900">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-20">
        {/* Background layers */}
        <div className="absolute inset-0 bg-dark-900" />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(57,255,20,0.12) 0%, transparent 70%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 50% 40% at 80% 80%, rgba(57,255,20,0.05) 0%, transparent 60%)' }} />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(57,255,20,1) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, #39FF14, transparent)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, #39FF14, transparent)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">

            {/* Badge */}
            <motion.div variants={fadeUp} className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.2)', color: '#39FF14' }}>
                <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                India's #1 Box Cricket Booking Platform
                <GiCricketBat />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.0] tracking-tight">
                <span className="text-white">Find Your</span>
                <br />
                <span className="neon-text">Cricket Turf</span>
                <br />
                <span className="text-white/60">Book It Now.</span>
              </h1>
            </motion.div>

            {/* Sub */}
            <motion.p variants={fadeUp} className="text-base md:text-lg text-gray-400 max-w-lg mx-auto leading-relaxed">
              Discover verified box cricket turfs near you and book your slot instantly — no calls, no hassle.
            </motion.p>

            {/* Trust pills */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2">
              {['Real-time availability', 'Instant confirmation', 'No advance payment'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-gray-400 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <FiCheck className="text-neon text-xs" /> {t}
                </span>
              ))}
            </motion.div>

            {/* Search bar */}
            <motion.form variants={fadeUp} onSubmit={handleSearch}
              className="relative max-w-2xl mx-auto mt-2">
              <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <FiSearch className="text-gray-500 flex-shrink-0" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search turf name or area..."
                    className="bg-transparent flex-1 outline-none text-sm text-white placeholder-gray-500"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl sm:w-44"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <FiMapPin className="text-neon flex-shrink-0 text-sm" />
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="bg-transparent flex-1 outline-none text-sm text-white appearance-none cursor-pointer"
                    style={{ color: city ? 'white' : '#6b7280' }}>
                    <option value="" style={{ background: '#111318' }}>All Cities</option>
                    {CITIES.map(c => <option key={c} value={c} style={{ background: '#111318' }}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary flex items-center justify-center gap-2 sm:px-8 py-3 text-sm">
                  <FiSearch className="text-sm" /> Search
                </button>
              </div>
            </motion.form>

            {/* City chips */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2">
              {CITIES.slice(0, 8).map(c => (
                <button key={c} onClick={() => navigate(`/turfs?city=${c}`)}
                  className="text-xs text-gray-400 px-3 py-1.5 rounded-full transition-all duration-200 hover:text-neon"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(57,255,20,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                  {c}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator — in flow, below content */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative z-10 flex flex-col items-center gap-2 text-gray-600 text-xs mt-10">
          <div className="w-5 h-8 rounded-full flex justify-center pt-1.5"
            style={{ border: '1.5px solid rgba(255,255,255,0.15)' }}>
            <div className="w-1 h-2 bg-neon rounded-full" />
          </div>
          <span>Scroll</span>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-neon text-sm font-semibold tracking-widest uppercase mb-3">Why BoxBook</motion.p>
            <motion.h2 variants={fadeUp} className="section-title">
              Everything you need to<br />
              <span className="text-neon">play your best game</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                className={`relative rounded-2xl p-6 transition-all duration-300 group cursor-default ${f.border}`}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${f.color}`}>
                  <f.icon className={`${f.iconColor} text-xl`} />
                </div>
                <h3 className="font-bold text-base mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(57,255,20,0.04) 0%, transparent 70%)' }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <p className="text-neon text-sm font-semibold tracking-widest uppercase mb-3">Simple Process</p>
              <h2 className="section-title">Book in <span className="text-neon">3 easy steps</span></h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.3), transparent)' }} />

              {STEPS.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-0"
                      style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.2)' }}>
                      <s.icon className="text-neon text-2xl" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neon flex items-center justify-center">
                      <span className="text-black text-xs font-black">{i + 1}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── OWNER CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}>
            <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(57,255,20,0.08) 0%, rgba(57,255,20,0.03) 50%, rgba(0,0,0,0) 100%)', border: '1px solid rgba(57,255,20,0.15)' }}>
              {/* BG decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2"
                style={{ background: 'radial-gradient(circle, #39FF14, transparent)' }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5 blur-3xl translate-y-1/2 -translate-x-1/2"
                style={{ background: 'radial-gradient(circle, #39FF14, transparent)' }} />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float"
                  style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.2)' }}>
                  <GiCricketBat className="text-neon text-3xl" />
                </div>
                <p className="text-neon text-sm font-semibold tracking-widest uppercase mb-3">For Turf Owners</p>
                <h2 className="text-3xl md:text-5xl font-black mb-4">
                  Own a Turf?<br />
                  <span className="text-neon">List it for free.</span>
                </h2>
                <p className="text-gray-400 max-w-lg mx-auto mb-3">
                  Reach thousands of players actively looking for turfs in your city.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-gray-500">
                  {['Free registration', 'Easy management', 'Instant bookings', 'Real-time analytics'].map(t => (
                    <span key={t} className="flex items-center gap-1.5">
                      <FiCheck className="text-neon" /> {t}
                    </span>
                  ))}
                </div>
                <a href="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
                  Register as Owner <FiArrowRight />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 px-4 relative">
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(57,255,20,0.02) 50%, transparent)' }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <p className="text-neon text-sm font-semibold tracking-widest uppercase mb-3">Support</p>
              <h2 className="section-title">Get in <span className="text-neon">Touch</span></h2>
              <p className="section-sub">We're here to help, any time.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: FiPhone, title: 'Call Us', value: '+91 98765 43210', sub: 'Mon–Sat, 9am–8pm', href: 'tel:+919876543210', color: 'text-blue-400', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
                { icon: FiMessageCircle, title: 'WhatsApp', value: '+91 98765 43210', sub: 'Quick replies guaranteed', href: 'https://wa.me/919876543210', color: 'text-neon', bg: 'rgba(57,255,20,0.08)', border: 'rgba(57,255,20,0.2)' },
                { icon: FiMail, title: 'Email Us', value: 'support@boxbook.in', sub: 'Reply within 24 hours', href: 'mailto:support@boxbook.in', color: 'text-purple-400', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)' },
              ].map((c, i) => (
                <motion.a key={i} variants={fadeUp} href={c.href} target="_blank" rel="noreferrer"
                  className="rounded-2xl p-6 text-center transition-all duration-300 group block"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = c.bg; e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <c.icon className={`${c.color} text-xl`} />
                  </div>
                  <h3 className="font-bold mb-1">{c.title}</h3>
                  <p className={`text-sm font-semibold mb-1 ${c.color}`}>{c.value}</p>
                  <p className="text-xs text-gray-600">{c.sub}</p>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
