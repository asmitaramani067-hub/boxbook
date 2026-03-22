import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiCalendar, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { staggerContainer, fadeUp } from '../animations/variants';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&q=80';

const STATUS = {
  confirmed: { label: 'Confirmed', cls: 'badge-green' },
  pending:   { label: 'Pending',   cls: 'badge-gold' },
  cancelled: { label: 'Cancelled', cls: 'badge-red' },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-ink-50">
      <div className="w-10 h-10 border-2 border-pitch-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-ink-50">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="accent-bar" />
          <h1 className="text-3xl font-black text-ink-900">My Bookings</h1>
          <p className="text-ink-500 mt-1 text-sm">{bookings.length} total bookings</p>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <p className="text-6xl mb-4">🏏</p>
            <h3 className="text-xl font-bold mb-2 text-ink-900">No bookings yet</h3>
            <p className="text-ink-500 mb-6">Find a turf and make your first booking!</p>
            <a href="/turfs" className="btn-primary">Find Turfs</a>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
            {bookings.map(b => {
              const status = STATUS[b.status] || STATUS.pending;
              return (
                <motion.div key={b._id} variants={fadeUp}
                  className="card card-hover rounded-2xl overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-32 h-32 sm:h-auto flex-shrink-0">
                      <img src={b.turf?.images?.[0] || PLACEHOLDER} alt={b.turf?.name}
                        className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <h3 className="font-bold text-base text-ink-900">{b.turf?.name}</h3>
                          <div className="flex items-center gap-1.5 text-sm text-ink-500 mt-1">
                            <FiMapPin className="text-pitch-600 text-xs" /> {b.turf?.location}
                          </div>
                        </div>
                        <span className={status.cls}>{status.label}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-ink-500">
                        <div className="flex items-center gap-1.5">
                          <FiCalendar className="text-pitch-600 text-xs" /> {b.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiClock className="text-pitch-600 text-xs" /> {b.timeSlot}
                        </div>
                        <div className="font-bold text-pitch-700">&#8377;{b.totalPrice}</div>
                      </div>

                      {b.status === 'confirmed' && (
                        <button onClick={() => cancelBooking(b._id)}
                          className="mt-3 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors font-medium">
                          <FiX className="text-xs" /> Cancel Booking
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
    </div>
  );
}
