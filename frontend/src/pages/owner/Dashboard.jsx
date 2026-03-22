import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiUsers, FiDollarSign, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { staggerContainer, fadeUp } from '../../animations/variants';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&q=80';

export default function OwnerDashboard() {
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('turfs');
  const { dark } = useTheme();

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

  const subText = dark ? 'text-gray-400' : 'text-gray-500';

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black">Owner Dashboard</h1>
            <p className={`mt-1 ${subText}`}>Manage your turfs and bookings</p>
          </div>
          <Link to="/owner/add-turf" className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Turf
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Turfs', value: turfs.length, icon: FiMapPin, color: 'text-neon' },
            { label: 'Total Bookings', value: bookings.length, icon: FiCalendar, color: 'text-blue-400' },
            { label: 'Confirmed', value: confirmedBookings, icon: FiUsers, color: 'text-green-400' },
            { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: 'text-yellow-400' },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeUp} className="glass rounded-2xl p-5">
              <s.icon className={`${s.color} text-2xl mb-2`} />
              <div className="text-2xl font-black">{s.value}</div>
              <div className={`text-sm ${subText}`}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['turfs', 'bookings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${activeTab === tab ? 'bg-neon text-black' : 'glass hover:border-neon/50'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Turfs tab */}
        {activeTab === 'turfs' && (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            {turfs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">🏟️</p>
                <h3 className="text-xl font-bold mb-2">No turfs yet</h3>
                <p className={`mb-6 ${subText}`}>Add your first turf to start receiving bookings</p>
                <Link to="/owner/add-turf" className="btn-primary">Add Your First Turf</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {turfs.map(turf => (
                  <motion.div key={turf._id} variants={fadeUp} className="glass rounded-2xl overflow-hidden">
                    <div className="relative h-40">
                      <img src={turf.images?.[0] || PLACEHOLDER} alt={turf.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xl font-black text-neon">₹{turf.pricePerHour}/hr</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-1">{turf.name}</h3>
                      <p className={`text-sm flex items-center gap-1 mb-3 ${subText}`}>
                        <FiMapPin className="text-neon" /> {turf.city}
                      </p>
                      <div className="flex gap-2">
                        <Link to={`/owner/edit-turf/${turf._id}`}
                          className="flex-1 flex items-center justify-center gap-1 btn-outline text-sm py-2">
                          <FiEdit2 /> Edit
                        </Link>
                        <button onClick={() => deleteTurf(turf._id)}
                          className="flex items-center gap-1 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Bookings tab */}
        {activeTab === 'bookings' && (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">📅</p>
                <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
                <p className={subText}>Bookings will appear here once players book your turfs</p>
              </div>
            ) : bookings.map(b => (
              <motion.div key={b._id} variants={fadeUp} className="glass rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <p className="font-semibold">{b.turf?.name}</p>
                  <p className={`text-sm ${subText}`}>{b.user?.name} • {b.user?.phone || b.user?.email}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={subText}>{b.date} • {b.timeSlot}</span>
                  <span className="text-neon font-bold">₹{b.totalPrice}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    b.status === 'confirmed' ? 'bg-neon/10 text-neon' :
                    b.status === 'cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>{b.status}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
