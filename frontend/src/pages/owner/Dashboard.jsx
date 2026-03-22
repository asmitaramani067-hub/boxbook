import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiUsers, FiMapPin, FiTrendingUp } from 'react-icons/fi';
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
    <div className="min-h-screen pt-20 flex items-center justify-center bg-ink-50">
      <div className="w-10 h-10 border-2 border-pitch-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: 'Total Turfs',    value: turfs.length,                          icon: FiMapPin,     bg: 'bg-pitch-100',  border: 'border-pitch-300',  text: 'text-pitch-800'  },
    { label: 'Total Bookings', value: bookings.length,                        icon: FiCalendar,   bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700'   },
    { label: 'Confirmed',      value: confirmedBookings,                      icon: FiUsers,      bg: 'bg-green-50',   border: 'border-green-200',  text: 'text-green-700'  },
    { label: 'Revenue',        value: `\u20B9${totalRevenue.toLocaleString()}`, icon: FiTrendingUp, bg: 'bg-gold-100',   border: 'border-gold-400',   text: 'text-gold-600'   },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-ink-50">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="accent-bar" />
            <h1 className="text-3xl font-black text-ink-900">Dashboard</h1>
            <p className="text-ink-500 mt-1 text-sm">Manage your turfs and bookings</p>
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
              className={`card p-5 border ${s.border}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg} border ${s.border}`}>
                <s.icon className={`text-lg ${s.text}`} />
              </div>
              <div className="text-2xl font-black text-ink-900">{s.value}</div>
              <div className="text-xs text-ink-500 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit bg-ink-100 border border-ink-300">
          {['turfs', 'bookings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-lg font-semibold text-sm capitalize transition-all duration-200"
              style={{
                background: activeTab === tab ? '#2E7D32' : 'transparent',
                color: activeTab === tab ? '#fff' : '#6B7280',
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
                <h3 className="text-xl font-bold mb-2 text-ink-900">No turfs yet</h3>
                <p className="text-ink-500 mb-6 text-sm">Add your first turf to start receiving bookings</p>
                <Link to="/owner/add-turf" className="btn-primary">Add Your First Turf</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {turfs.map(turf => (
                  <motion.div key={turf._id} variants={fadeUp} className="card card-hover overflow-hidden">
                    <div className="relative h-40">
                      <img src={turf.images?.[0] || PLACEHOLDER} alt={turf.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xl font-black text-white drop-shadow">
                          &#8377;{turf.pricePerHour}/hr
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-ink-900 mb-1">{turf.name}</h3>
                      <p className="text-sm text-ink-500 flex items-center gap-1.5 mb-4">
                        <FiMapPin className="text-pitch-600 text-xs" /> {turf.city}
                      </p>
                      <div className="flex gap-2">
                        <Link to={`/owner/edit-turf/${turf._id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 btn-outline text-sm py-2">
                          <FiEdit2 className="text-xs" /> Edit
                        </Link>
                        <button onClick={() => deleteTurf(turf._id)}
                          className="flex items-center gap-1 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm border border-red-200">
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
                <h3 className="text-xl font-bold mb-2 text-ink-900">No bookings yet</h3>
                <p className="text-ink-500 text-sm">Bookings will appear here once players book your turfs</p>
              </div>
            ) : bookings.map(b => (
              <motion.div key={b._id} variants={fadeUp}
                className="card p-4 flex flex-wrap gap-4 items-center justify-between card-hover">
                <div>
                  <p className="font-semibold text-ink-900 text-sm">{b.turf?.name}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{b.user?.name} &bull; {b.user?.phone || b.user?.email}</p>
                </div>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="text-ink-500">{b.date} &bull; {b.timeSlot}</span>
                  <span className="text-pitch-700 font-bold">&#8377;{b.totalPrice}</span>
                  <span className={
                    b.status === 'confirmed' ? 'badge-green' :
                    b.status === 'cancelled' ? 'badge-red' : 'badge-gold'
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
