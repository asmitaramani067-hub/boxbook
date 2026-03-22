import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiCalendar, FiX, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { staggerContainer, fadeUp } from '../animations/variants';
import ConfirmDialog from '../components/ConfirmDialog';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&q=80';

const STATUS_STYLES = {
  confirmed: { label: 'Confirmed', bg: 'bg-pitch-100', text: 'text-pitch-800', border: 'border-pitch-300', dot: 'bg-pitch-500' },
  pending:   { label: 'Pending',   bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50',    text: 'text-red-600',   border: 'border-red-200',   dot: 'bg-red-500' },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [confirmCancel, setConfirmCancel] = useState(null); // bookingId

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setConfirmCancel(null);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-ink-50">
      <div className="w-10 h-10 border-2 border-pitch-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pb-20 bg-ink-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-700 px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-pitch-300 text-xs font-bold tracking-widest uppercase mb-1">Your Activity</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">My Bookings</h1>
          <p className="text-pitch-300 text-sm">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-ink-100 shadow-lg shadow-black/5">
          {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all duration-200 ${
                filter === f
                  ? 'bg-pitch-700 text-white shadow-md shadow-pitch-700/20'
                  : 'text-ink-500 hover:text-ink-900'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 bg-white rounded-2xl border border-ink-100">
            <p className="text-6xl mb-4">🏏</p>
            <h3 className="text-xl font-bold mb-2 text-ink-900">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-ink-500 mb-6 text-sm">
              {filter === 'all' ? 'Find a turf and make your first booking!' : 'Try a different filter'}
            </p>
            {filter === 'all' && (
              <a href="/turfs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-pitch-700 to-pitch-600 text-white shadow-md">
                Find Turfs <FiArrowRight />
              </a>
            )}
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-3">
            {filtered.map(b => {
              const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
              return (
                <motion.div key={b._id} variants={fadeUp}
                  className="bg-white rounded-2xl overflow-hidden border border-ink-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex">
                    {/* Image */}
                    <div className="w-28 sm:w-36 flex-shrink-0">
                      <img src={b.turf?.images?.[0] || PLACEHOLDER} alt={b.turf?.name}
                        className="w-full h-full object-cover" style={{ minHeight: '120px' }} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-sm sm:text-base text-ink-900 truncate">{b.turf?.name}</h3>
                        <span className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-3">
                        <FiMapPin className="text-pitch-600 flex-shrink-0" />
                        <span className="truncate">{b.turf?.location}</span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-ink-500">
                        <div className="flex items-center gap-1.5">
                          <FiCalendar className="text-pitch-600" /> {b.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiClock className="text-pitch-600" /> {b.timeSlot}
                        </div>
                        {b.box?.name && (
                          <div className="flex items-center gap-1.5 font-medium text-pitch-700">
                            📦 {b.box.name}
                          </div>
                        )}
                        <div className="font-black text-pitch-700 text-sm">&#8377;{b.totalPrice}</div>
                      </div>

                      {b.status === 'confirmed' && (
                        <button onClick={() => setConfirmCancel(b._id)}
                          className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold transition-colors">
                          <FiX className="text-xs" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmCancel}
        title="Cancel Booking?"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Yes, Cancel"
        danger
        onConfirm={() => cancelBooking(confirmCancel)}
        onCancel={() => setConfirmCancel(null)}
      />
    </div>
  );
}
