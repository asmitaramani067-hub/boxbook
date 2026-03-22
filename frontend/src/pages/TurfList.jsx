import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiFilter, FiX } from 'react-icons/fi';
import api from '../services/api';
import TurfCard from '../components/TurfCard';
import SkeletonCard from '../components/SkeletonCard';
import { useTheme } from '../context/ThemeContext';
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
  const { dark } = useTheme();
  const subText = dark ? 'text-gray-400' : 'text-gray-500';
  const inputBg = dark ? 'bg-dark-700' : 'bg-gray-100';
  const inputText = dark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400';

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
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black mb-1">Find Turfs</h1>
          <p className={subText}>{turfs.length} turfs available</p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-4 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className={`flex-1 flex items-center gap-2 ${inputBg} rounded-xl px-4 py-3`}>
              <FiSearch className={dark ? 'text-gray-400' : 'text-gray-500'} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or area..." className={`bg-transparent flex-1 outline-none text-sm ${inputText}`} />
            </div>
            <div className={`flex items-center gap-2 ${inputBg} rounded-xl px-4 py-3 sm:w-44`}>
              <FiMapPin className={dark ? 'text-gray-400' : 'text-gray-500'} />
              <select value={city} onChange={e => setCity(e.target.value)}
                className={`bg-transparent flex-1 outline-none text-sm appearance-none cursor-pointer ${dark ? 'text-white' : 'text-gray-800'}`}>
                <option value="" className="bg-dark-700">All Cities</option>
                {CITIES.map(c => <option key={c} value={c} className="bg-dark-700">{c}</option>)}
              </select>
            </div>
            <button type="button" onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-2 glass px-4 py-3 rounded-xl hover:border-neon/50 transition-colors text-sm">
              <FiFilter /> Filters
            </button>
            <button type="submit" className="btn-primary px-6">Search</button>
          </form>

          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Min Price (₹/hr)</label>
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  placeholder="0" className="input-field w-32 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Max Price (₹/hr)</label>
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  placeholder="5000" className="input-field w-32 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Sort By</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="input-field w-40 py-2 text-sm appearance-none">
                  <option value="newest" className="bg-dark-700">Newest</option>
                  <option value="price-asc" className="bg-dark-700">Price: Low to High</option>
                  <option value="price-desc" className="bg-dark-700">Price: High to Low</option>
                  <option value="rating" className="bg-dark-700">Top Rated</option>
                </select>
              </div>
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors">
                <FiX /> Clear
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : turfs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-5xl mb-4">🏏</p>
            <h3 className="text-xl font-bold mb-2">No turfs found</h3>
            <p className={subText}>Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-outline mt-4">Clear Filters</button>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {turfs.map(turf => <TurfCard key={turf._id} turf={turf} />)}
          </motion.div>
        )}
      </div>
    </div>
  );
}
