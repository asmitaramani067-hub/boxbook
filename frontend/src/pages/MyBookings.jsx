import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiCalendar, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { staggerContainer, fadeUp } from '../animations/variants';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&q=80';

const STATUS_COLORS = {
  confirmed: 'text-neon bg-neon/10 border-neon/20',
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dark } = useTheme();

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
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const subText = dark ? 'text-gray-400' : 'text-gray-500';
  const bodyText = dark ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black">My Bookings</h1>
          <p className={`mt-1 ${subText}`}>{bookings.length} total bookings</p>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-5xl mb-4">🏏</p>
            <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
            <p className={`mb-6 ${subText}`}>Find a turf and make your first booking!</p>
            <a href="/turfs" className="btn-primary">Find Turfs</a>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
            {bookings.map(b => (
              <motion.div key={b._id} variants={fadeUp} className="glass rounded-2xl overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-32 h-32 sm:h-auto flex-shrink-0">
                    <img src={b.turf?.images?.[0] || PLACEHOLDER} alt={b.turf?.name}
                      className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <h3 className="font-bold text-lg">{b.turf?.name}</h3>
                        <div className={`flex items-center gap-1 text-sm mt-1 ${subText}`}>
                          <FiMapPin className="text-neon" /> {b.turf?.location}
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${STATUS_COLORS[b.status]}`}>
                        {b.status}
                      </span>
                    </div>

                    <div className={`flex flex-wrap gap-4 mt-3 text-sm ${bodyText}`}>
                      <div className="flex items-center gap-1">
                        <FiCalendar className="text-neon" /> {b.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock className="text-neon" /> {b.timeSlot}
                      </div>
                      <div className="font-bold text-neon">₹{b.totalPrice}</div>
                    </div>

                    {b.status === 'confirmed' && (
                      <button onClick={() => cancelBooking(b._id)}
                        className="mt-3 flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                        <FiX /> Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
