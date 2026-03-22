import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiArrowRight, FiZap, FiShield, FiStar, FiPhone, FiMail, FiMessageCircle } from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';
import { useTheme } from '../context/ThemeContext';
import { fadeUp, staggerContainer, scaleIn } from '../animations/variants';
import { CITIES } from '../constants';
export { CITIES };

const FEATURES = [
  { icon: FiZap, title: 'Instant Booking', desc: 'Book your slot in seconds — no waiting, no hassle.' },
  { icon: FiShield, title: 'Verified Turfs', desc: 'Every turf is verified and quality-checked.' },
  { icon: FiStar, title: 'Top Rated', desc: 'Real reviews from real players.' },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();
  const { dark } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    navigate(`/turfs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className={`absolute inset-0 ${dark ? 'bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(57,255,20,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(57,255,20,0.05),transparent_60%)]" />
        {dark && <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)', backgroundSize: '60px 60px' }} />}

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-neon mb-6 border border-neon/20">
              <GiCricketBat className="text-neon" />
              <span>India's #1 Box Cricket Booking Platform 🏏</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-4">
              Find Your
              <span className="block neon-text">Cricket Turf</span>
              <span className={`block ${dark ? 'text-gray-300' : 'text-gray-600'}`}>Book It Now!</span>
            </motion.h1>

            <motion.p variants={fadeUp} className={`text-lg md:text-xl max-w-2xl mx-auto mb-3 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
              Discover the best box cricket turfs in your city and book instantly.
            </motion.p>
            <motion.p variants={fadeUp} className={`text-sm max-w-xl mx-auto mb-10 ${dark ? 'text-gray-500' : 'text-gray-500'}`}>
              Real-time availability • Instant confirmation • No advance payment
            </motion.p>

            {/* Search */}
            <motion.form variants={fadeUp} onSubmit={handleSearch}
              className="glass rounded-2xl p-3 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className={`flex-1 flex items-center gap-2 rounded-xl px-4 py-3 ${dark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                <FiSearch className={dark ? 'text-gray-400 flex-shrink-0' : 'text-gray-500 flex-shrink-0'} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by turf name or area..."
                  className={`bg-transparent flex-1 outline-none text-sm ${dark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}`} />
              </div>
              <div className={`flex items-center gap-2 rounded-xl px-4 py-3 sm:w-44 ${dark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                <FiMapPin className={dark ? 'text-gray-400 flex-shrink-0' : 'text-gray-500 flex-shrink-0'} />
                <select value={city} onChange={e => setCity(e.target.value)}
                  className={`bg-transparent flex-1 outline-none text-sm appearance-none cursor-pointer ${dark ? 'text-white' : 'text-gray-800'}`}>
                  <option value="" className="bg-dark-700">All Cities</option>
                  {CITIES.map(c => <option key={c} value={c} className="bg-dark-700">{c}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary flex items-center justify-center gap-2 sm:px-8">
                <FiSearch /> Search
              </button>
            </motion.form>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mt-6">
              {CITIES.map(c => (
                <button key={c} onClick={() => navigate(`/turfs?city=${c}`)}
                  className="text-xs glass px-3 py-1.5 rounded-full hover:border-neon/50 hover:text-neon transition-colors">
                  {c}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-500 text-xs">
          <div className="w-5 h-8 border-2 border-gray-600 rounded-full flex justify-center pt-1">
            <div className="w-1 h-2 bg-neon rounded-full" />
          </div>
          Scroll Down
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl font-black mb-3">
              Why Choose <span className="text-neon">BoxBook</span>?
            </motion.h2>
            <motion.p variants={fadeUp} className={dark ? 'text-gray-400' : 'text-gray-500'}>Simple, fast and reliable booking experience</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                className="glass rounded-2xl p-6 text-center hover:border-neon/30 transition-colors group">
                <div className="w-14 h-14 bg-neon/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-neon/20 transition-colors">
                  <f.icon className="text-neon text-2xl" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className={`py-16 px-4 ${dark ? 'bg-dark-800/50' : 'bg-gray-100/80'}`}>
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-3xl font-black mb-12">
              How It Works? <span className="text-neon">3 Steps</span>
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Find a Turf', desc: 'Search available turfs in your city' },
                { step: '02', title: 'Pick a Slot', desc: 'Select a date and time that works for you' },
                { step: '03', title: 'Book It!', desc: 'Confirm your booking and head to the turf' },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-neon flex items-center justify-center text-neon font-black text-xl mb-4">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Owner CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
            className="glass rounded-3xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.08),transparent_70%)]" />
            <div className="relative z-10">
              <GiCricketBat className="text-neon text-5xl mx-auto mb-4 animate-float" />
              <h2 className="text-3xl md:text-4xl font-black mb-3">Own a Turf?</h2>
              <p className={`mb-2 max-w-xl mx-auto ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                List your turf on BoxBook and reach thousands of players.
              </p>
              <p className={`text-sm mb-8 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Free registration • Easy management • Instant bookings</p>
              <a href="/register" className="btn-primary inline-flex items-center gap-2">
                Register as Owner <FiArrowRight />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Us */}
      <section id="contact" className={`py-20 px-4 ${dark ? 'bg-dark-800/50' : 'bg-gray-100/80'}`}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl font-black mb-3">Get in <span className="text-neon">Touch</span></h2>
              <p className={dark ? 'text-gray-400' : 'text-gray-500'}>Have a question? We're here to help!</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: FiPhone, title: 'Call Us', value: '+91 98765 43210', sub: 'Mon–Sat, 9am–8pm', href: 'tel:+919876543210' },
                { icon: FiMessageCircle, title: 'WhatsApp', value: '+91 98765 43210', sub: 'Quick replies guaranteed', href: 'https://wa.me/919876543210' },
                { icon: FiMail, title: 'Email Us', value: 'support@boxbook.in', sub: 'Reply within 24 hours', href: 'mailto:support@boxbook.in' },
              ].map((c, i) => (
                <motion.a key={i} variants={fadeUp} href={c.href} target="_blank" rel="noreferrer"
                  className="glass rounded-2xl p-6 text-center hover:border-neon/40 transition-all group card-hover">
                  <div className="w-12 h-12 bg-neon/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-neon/20 transition-colors">
                    <c.icon className="text-neon text-xl" />
                  </div>
                  <h3 className="font-bold mb-1">{c.title}</h3>
                  <p className="text-neon text-sm font-semibold">{c.value}</p>
                  <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{c.sub}</p>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
