import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiFilter, FiX, FiSliders } from 'react-icons/fi';
import api from '../services/api';
import TurfCard from '../components/TurfCard';
import SkeletonCard from '../components/SkeletonCard';
import { staggerContainer, fadeUp } from '../animations/variants';
import { CITIES } from '../constants';

export default function TurfList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const fetchTurfs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (city) params.city = city;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const { data } = await api.get('/turfs', { params });
      let sorted = [...data];
      if (sortBy === 'price-asc') sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
      if (sortBy === 'price-desc') sorted.sort((a, b) => b.pricePerHour - a.pricePerHour);
      if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
      setTurfs(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTurfs(); }, [city, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTurfs();
  };

  const clearFilters = () => {
    setSearch(''); setCity(''); setMinPrice(''); setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-dark-900">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-neon text-xs font-semibold tracking-widest uppercase mb-2">Explore</p>
          <h1 className="text-3xl font-black text-white">Find Turfs</h1>
          <p className="text-gray-500 mt-1 text-sm">{turfs.length} turfs available</p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl p-4 mb-8"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <FiSearch className="text-gray-500 flex-shrink-0 text-sm" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or area..."
                className="bg-transparent flex-1 outline-none text-sm text-white placeholder-gray-600" />
            </div>
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 sm:w-44"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <FiMapPin className="text-neon flex-shrink-0 text-sm" />
              <select value={city} onChange={e => setCity(e.target.value)}
                className="bg-transparent flex-1 outline-none text-sm appearance-none cursor-pointer text-white">
                <option value="" style={{ background: '#111318' }}>All Cities</option>
                {CITIES.map(c => <option key={c} value={c} style={{ background: '#111318' }}>{c}</option>)}
              </select>
            </div>
            <button type="button" onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${showFilters ? 'text-neon' : 'text-gray-400 hover:text-white'}`}
              style={{ background: showFilters ? 'rgba(57,255,20,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${showFilters ? 'rgba(57,255,20,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
              <FiSliders className="text-sm" /> Filters
            </button>
            <button type="submit" className="btn-primary px-6 text-sm">Search</button>
          </form>

          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 pt-4 flex flex-wrap gap-4 items-end"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Min Price (&#8377;/hr)</label>
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  placeholder="0" className="input-field w-32 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Max Price (&#8377;/hr)</label>
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  placeholder="5000" className="input-field w-32 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Sort By</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="input-field w-44 py-2 text-sm appearance-none">
                  <option value="newest" style={{ background: '#111318' }}>Newest</option>
                  <option value="price-asc" style={{ background: '#111318' }}>Price: Low to High</option>
                  <option value="price-desc" style={{ background: '#111318' }}>Price: High to Low</option>
                  <option value="rating" style={{ background: '#111318' }}>Top Rated</option>
                </select>
              </div>
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-xl hover:bg-red-500/10">
                <FiX /> Clear all
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : turfs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <p className="text-6xl mb-4">🏏</p>
            <h3 className="text-xl font-bold mb-2 text-white">No turfs found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {turfs.map(turf => <TurfCard key={turf._id} turf={turf} />)}
          </motion.div>
        )}
      </div>
    </div>
  );
}
