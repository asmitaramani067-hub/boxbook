import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiUsers, FiDollarSign, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { staggerContainer, fadeUp } from '../../animations/variants';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&q=80';

export default function OwnerDashboard() {
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('turfs');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [turfsRes, bookingsRes] = await Promise.all([
        api.get('/turfs/my'),
        api.get('/bookings/owner'),
      ]);
      setTurfs(turfsRes.data);
      setBookings(bookingsRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const deleteTurf = async (id) => {
    if (!confirm('Delete this turf? This cannot be undone.')) return;
    try {
      await api.delete(`/turfs/${id}`);
      toast.success('Turf deleted');
      setTurfs(t => t.filter(x => x._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.totalPrice, 0);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-dark-900">
      <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: 'Total Turfs', value: turfs.length, icon: FiMapPin, color: '#39FF14', bg: 'rgba(57,255,20,0.08)', border: 'rgba(57,255,20,0.2)' },
    { label: 'Total Bookings', value: bookings.length, icon: FiCalendar, color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' },
    { label: 'Confirmed', value: confirmedBookings, icon: FiUsers, color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' },
    { label: 'Revenue', value: `\u20B9${totalRevenue.toLocaleString()}`, icon: FiTrendingUp, color: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.2)' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-dark-900">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-neon text-xs font-semibold tracking-widest uppercase mb-2">Owner</p>
            <h1 className="text-3xl font-black text-white">Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your turfs and bookings</p>
          </div>
          <Link to="/owner/add-turf" className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus /> Add Turf
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={i} variants={fadeUp}
              className="rounded-2xl p-5 transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => { e.currentTarget.style.background = s.bg; e.currentTarget.style.borderColor = s.border; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <s.icon style={{ color: s.color }} className="text-lg" />
              </div>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl w-fit"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {['turfs', 'bookings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-lg font-semibold text-sm capitalize transition-all duration-200"
              style={{
                background: activeTab === tab ? '#39FF14' : 'transparent',
                color: activeTab === tab ? '#000' : '#6b7280',
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Turfs */}
        {activeTab === 'turfs' && (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            {turfs.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🏟️</p>
                <h3 className="text-xl font-bold mb-2 text-white">No turfs yet</h3>
                <p className="text-gray-500 mb-6 text-sm">Add your first turf to start receiving bookings</p>
                <Link to="/owner/add-turf" className="btn-primary">Add Your First Turf</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {turfs.map(turf => (
                  <motion.div key={turf._id} variants={fadeUp}
                    className="rounded-2xl overflow-hidden transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(57,255,20,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                    <div className="relative h-40">
                      <img src={turf.images?.[0] || PLACEHOLDER} alt={turf.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xl font-black text-neon" style={{ textShadow: '0 0 15px rgba(57,255,20,0.5)' }}>
                          &#8377;{turf.pricePerHour}/hr
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white mb-1">{turf.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4">
                        <FiMapPin className="text-neon text-xs" /> {turf.city}
                      </p>
                      <div className="flex gap-2">
                        <Link to={`/owner/edit-turf/${turf._id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 btn-outline text-sm py-2">
                          <FiEdit2 className="text-xs" /> Edit
                        </Link>
                        <button onClick={() => deleteTurf(turf._id)}
                          className="flex items-center gap-1 px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                          style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">📅</p>
                <h3 className="text-xl font-bold mb-2 text-white">No bookings yet</h3>
                <p className="text-gray-500 text-sm">Bookings will appear here once players book your turfs</p>
              </div>
            ) : bookings.map(b => (
              <motion.div key={b._id} variants={fadeUp}
                className="rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                <div>
                  <p className="font-semibold text-white text-sm">{b.turf?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{b.user?.name} &bull; {b.user?.phone || b.user?.email}</p>
                </div>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="text-gray-500">{b.date} &bull; {b.timeSlot}</span>
                  <span className="text-neon font-bold">&#8377;{b.totalPrice}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                    style={
                      b.status === 'confirmed'
                        ? { background: 'rgba(57,255,20,0.08)', color: '#39FF14', border: '1px solid rgba(57,255,20,0.2)' }
                        : b.status === 'cancelled'
                        ? { background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
                        : { background: 'rgba(250,204,21,0.08)', color: '#facc15', border: '1px solid rgba(250,204,21,0.2)' }
                    }>
                    {b.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
