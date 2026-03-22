import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiStar, FiSearch, FiPhone } from 'react-icons/fi';
import { EXPLORE_TURFS } from '../data/exploreTurfs';
import { staggerContainer, fadeUp } from '../animations/variants';

const CITIES = ['All', ...Array.from(new Set(EXPLORE_TURFS.map(t => t.city))).sort()];

export default function ExploreTurfs() {
  const [city, setCity] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = EXPLORE_TURFS.filter(t => {
    const matchCity = city === 'All' || t.city === city;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchSearch;
  });

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-ink-50">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="accent-bar" />
          <h1 className="text-3xl font-black text-ink-900">Explore Cricket Venues</h1>
          <p className="text-ink-500 mt-1 text-sm">
            Discover box cricket grounds across India — not yet on PitchUp, but you can contact them directly.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or area..."
              className="input-field pl-9 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CITIES.map(c => (
              <button key={c} onClick={() => setCity(c)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: city === c ? '#2E7D32' : '#fff',
                  color: city === c ? '#fff' : '#374151',
                  border: city === c ? '1px solid #2E7D32' : '1px solid #E5E7EB',
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏏</p>
            <h3 className="text-xl font-bold text-ink-900 mb-2">No venues found</h3>
            <p className="text-ink-500">Try a different city or search term</p>
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(turf => (
              <motion.div key={turf.id} variants={fadeUp}>
                <Link to={`/explore/${turf.id}`} className="card card-hover block overflow-hidden group">
                  <div className="relative h-44 overflow-hidden">
                    <img src={turf.image} alt={turf.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute top-3 right-3 badge-gold">Not on PitchUp</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-ink-900 mb-1">{turf.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-ink-500 mb-3">
                      <FiMapPin className="text-pitch-600 text-xs flex-shrink-0" />
                      <span className="truncate">{turf.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm">
                        <FiStar className="text-gold-500 text-xs" />
                        <span className="font-semibold text-ink-900">{turf.rating}</span>
                        <span className="text-ink-500">({turf.reviews})</span>
                      </div>
                      <span className="font-bold text-pitch-700 text-sm">{turf.price}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-1.5 text-xs text-ink-500">
                      <FiPhone className="text-pitch-600 text-xs" />
                      <span>{turf.phone}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
