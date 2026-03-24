import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiUsers, FiMapPin, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { staggerContainer, fadeUp } from '../../animations/variants';
import BoxManager from './BoxManager';
import ConfirmDialog from '../../components/ConfirmDialog';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&q=80';

export default function OwnerDashboard() {
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('turfs');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [chartRange, setChartRange] = useState('week'); // 'week' | 'month'

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
    try {
      await api.delete(`/turfs/${id}`);
      toast.success('Turf deleted');
      setTurfs(t => t.filter(x => x._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setConfirmDelete(null);
    }
  };

  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.totalPrice, 0);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

  // Build chart data
  const buildChartData = () => {
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const days = chartRange === 'week' ? 7 : 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = chartRange === 'week'
        ? d.toLocaleDateString('en-IN', { weekday: 'short' })
        : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const dayBookings = confirmed.filter(b => b.date === dateStr || b.createdAt?.startsWith(dateStr));
      data.push({
        label,
        bookings: dayBookings.length,
        revenue: dayBookings.reduce((s, b) => s + b.totalPrice, 0),
      });
    }
    return data;
  };
  const chartData = buildChartData();

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
          {['turfs', 'bookings', 'analytics'].map(tab => (
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
                      <div className="flex gap-2 mb-2">
                        <Link to={`/owner/edit-turf/${turf._id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 btn-outline text-sm py-2">
                          <FiEdit2 className="text-xs" /> Edit
                        </Link>
                        <button onClick={() => setConfirmDelete(turf._id)}
                          className="flex items-center gap-1 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm border border-red-200">
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                      {/* Box manager inline */}
                      <BoxManager turfId={turf._id} turfTimeSlots={turf.timeSlots || []} />
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
                  {b.box?.name && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-pitch-50 border border-pitch-200 text-pitch-700">
                      📦 {b.box.name}
                    </span>
                  )}
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
        {/* Analytics */}
        {activeTab === 'analytics' && (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
            {/* Range toggle */}
            <div className="flex items-center gap-2">
              {['week', 'month'].map(r => (
                <button key={r} onClick={() => setChartRange(r)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                  style={{
                    background: chartRange === r ? '#2E7D32' : '#F3F4F6',
                    color: chartRange === r ? '#fff' : '#6B7280',
                  }}>
                  Last {r === 'week' ? '7 days' : '30 days'}
                </button>
              ))}
            </div>

            {/* Revenue chart */}
            <motion.div variants={fadeUp} className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <FiBarChart2 className="text-pitch-700" />
                <h3 className="font-bold text-ink-900">Revenue & Bookings</h3>
              </div>
              {chartData.every(d => d.revenue === 0 && d.bookings === 0) ? (
                <div className="flex flex-col items-center justify-center py-16 text-ink-400">
                  <FiBarChart2 className="text-4xl mb-3 opacity-30" />
                  <p className="text-sm">No confirmed bookings in this period yet.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="rev" orientation="left" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
                      tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`} />
                    <YAxis yAxisId="bk" orientation="right" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                      formatter={(value, name) => name === 'Revenue' ? [`₹${value}`, name] : [value, name]} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                    <Bar yAxisId="rev" dataKey="revenue" name="Revenue" fill="#2E7D32" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <Bar yAxisId="bk" dataKey="bookings" name="Bookings" fill="#A5D6A7" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Per-turf breakdown */}
            <motion.div variants={fadeUp} className="card p-6">
              <h3 className="font-bold text-ink-900 mb-4">Per-Turf Breakdown</h3>
              {turfs.length === 0 ? (
                <p className="text-sm text-ink-400">No turfs yet.</p>
              ) : (
                <div className="space-y-3">
                  {turfs.map(turf => {
                    const turfBookings = bookings.filter(b => b.turf?._id === turf._id || b.turf === turf._id);
                    const turfRevenue = turfBookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.totalPrice, 0);
                    const turfConfirmed = turfBookings.filter(b => b.status === 'confirmed').length;
                    const pct = totalRevenue > 0 ? Math.round((turfRevenue / totalRevenue) * 100) : 0;
                    return (
                      <div key={turf._id} className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-ink-800 truncate">{turf.name}</span>
                            <span className="text-sm font-black text-pitch-700 ml-2">₹{turfRevenue.toLocaleString()}</span>
                          </div>
                          <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                            <div className="h-full rounded-full bg-pitch-600 transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-xs text-ink-400 mt-1">{turfConfirmed} confirmed booking{turfConfirmed !== 1 ? 's' : ''} · {pct}% of revenue</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Turf?"
        message="This will permanently delete the turf and cannot be undone."
        confirmText="Delete"
        danger
        onConfirm={() => deleteTurf(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
