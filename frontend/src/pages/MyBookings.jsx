import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiClock, FiCalendar, FiX, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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

// ── Reschedule Modal ───────────────────────────────────────────────────────
function RescheduleModal({ booking, onClose, onSuccess }) {
  const [date, setDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSlots(); }, [date]);

  const fetchSlots = async () => {
    setLoading(true);
    setSelectedSlot('');
    try {
      const turfId = booking.turf?._id || booking.turf;
      const dateStr = date.toISOString().split('T')[0];
      const { data } = await api.get(`/turfs/${turfId}/availability`, { params: { date: dateStr } });
      setAvailability(data);
      setSlots(Object.keys(data).sort());
    } catch {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlot) return toast.error('Please select a new slot');
    setSaving(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const { data } = await api.put(`/bookings/${booking._id}/reschedule`, { date: dateStr, timeSlot: selectedSlot });
      toast.success('Booking rescheduled!');
      onSuccess(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reschedule failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        <div className="bg-gradient-to-r from-pitch-900 to-pitch-700 px-6 py-5 relative">
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
            <FiX className="text-sm" />
          </button>
          <h2 className="text-white font-black text-lg">Reschedule Booking</h2>
          <p className="text-pitch-300 text-xs mt-0.5">{booking.turf?.name} · Current: {booking.date} {booking.timeSlot}</p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">New Date</label>
            <DatePicker selected={date} onChange={d => setDate(d)} minDate={new Date()}
              dateFormat="dd/MM/yyyy" className="input-field w-full text-sm cursor-pointer" wrapperClassName="w-full" />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">New Slot</label>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-pitch-700 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-ink-400 italic">No slots available for this date.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {slots.map(slot => {
                  const info = availability[slot];
                  const avail = info?.available ?? 0;
                  const isFull = avail === 0 && (info?.total ?? 0) > 0;
                  const isCurrentSlot = slot === booking.timeSlot && date.toISOString().split('T')[0] === booking.date;
                  return (
                    <button key={slot} disabled={isFull || isCurrentSlot}
                      onClick={() => setSelectedSlot(slot)}
                      className="py-2 px-3 rounded-xl text-xs font-medium text-left transition-all"
                      style={{
                        background: isCurrentSlot ? '#F3F4F6' : isFull ? '#FEF2F2' : selectedSlot === slot ? '#2E7D32' : '#F9FAFB',
                        border: isCurrentSlot ? '1px solid #D1D5DB' : isFull ? '1px solid #FECACA' : selectedSlot === slot ? '1px solid #2E7D32' : '1px solid #E5E7EB',
                        color: isCurrentSlot ? '#9CA3AF' : isFull ? '#EF4444' : selectedSlot === slot ? '#fff' : '#374151',
                        cursor: (isFull || isCurrentSlot) ? 'not-allowed' : 'pointer',
                      }}>
                      <div className="font-semibold">{selectedSlot === slot ? '✓ ' : ''}{slot}</div>
                      <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '1px' }}>
                        {isCurrentSlot ? 'Current slot' : isFull ? '🔴 Full' : `🟢 ${avail} free`}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold text-sm border border-ink-200 text-ink-600 hover:bg-ink-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleReschedule} disabled={saving || !selectedSlot}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-pitch-700 text-white hover:bg-pitch-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiRefreshCw className="text-xs" /> Reschedule</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);

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

  const handleRescheduleSuccess = (updated) => {
    setBookings(prev => prev.map(b => b._id === updated._id ? { ...b, ...updated } : b));
    setRescheduleBooking(null);
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-ink-50">
      <div className="w-10 h-10 border-2 border-pitch-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {rescheduleBooking && (
          <RescheduleModal booking={rescheduleBooking}
            onClose={() => setRescheduleBooking(null)}
            onSuccess={handleRescheduleSuccess} />
        )}
      </AnimatePresence>

      <div className="min-h-screen pb-20 bg-ink-50">
        <div className="bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-700 px-4 pt-24 pb-16">
          <div className="max-w-4xl mx-auto">
            <p className="text-pitch-300 text-xs font-bold tracking-widest uppercase mb-1">Your Activity</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">My Bookings</h1>
            <p className="text-pitch-300 text-sm">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-6">
          <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-ink-100 shadow-lg shadow-black/5">
            {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all duration-200 ${
                  filter === f ? 'bg-pitch-700 text-white shadow-md shadow-pitch-700/20' : 'text-ink-500 hover:text-ink-900'
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
                <a href="/turfs" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-pitch-700 to-pitch-600 text-white shadow-md">
                  Find Turfs <FiArrowRight />
                </a>
              )}
            </motion.div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-3">
              {filtered.map(b => {
                const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
                const isUpcoming = b.status === 'confirmed' && new Date(`${b.date}T${b.timeSlot?.split('-')[0]}`) > new Date();
                return (
                  <motion.div key={b._id} variants={fadeUp}
                    className="bg-white rounded-2xl overflow-hidden border border-ink-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex">
                      <div className="w-28 sm:w-36 flex-shrink-0">
                        <img src={b.turf?.images?.[0] || PLACEHOLDER} alt={b.turf?.name}
                          className="w-full h-full object-cover" style={{ minHeight: '120px' }} />
                      </div>
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
                          <div className="flex items-center gap-1.5"><FiCalendar className="text-pitch-600" /> {b.date}</div>
                          <div className="flex items-center gap-1.5"><FiClock className="text-pitch-600" /> {b.timeSlot}</div>
                          {b.box?.name && <div className="flex items-center gap-1.5 font-medium text-pitch-700">📦 {b.box.name}</div>}
                          <div className="font-black text-pitch-700 text-sm">₹{b.totalPrice}</div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          {isUpcoming && (
                            <button onClick={() => setRescheduleBooking(b)}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-50">
                              <FiRefreshCw className="text-xs" /> Reschedule
                            </button>
                          )}
                          {b.status === 'confirmed' && (
                            <button onClick={() => setConfirmCancel(b._id)}
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold transition-colors">
                              <FiX className="text-xs" /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
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
    </>
  );
}
