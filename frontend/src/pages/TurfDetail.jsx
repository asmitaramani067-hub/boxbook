import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiPhone, FiStar, FiClock, FiArrowLeft, FiMessageCircle, FiCheck, FiBox, FiCalendar, FiLock, FiBell, FiBellOff } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { fadeUp, staggerContainer } from '../animations/variants';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80';

// ── Booking success modal ──────────────────────────────────────────────────
function BookingSuccessModal({ booking, onClose }) {
  const slots = booking.slots || [booking];
  const totalPaid = slots.reduce((s, b) => s + (b.totalPrice || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
        {/* Tick animation */}
        <div className="w-20 h-20 rounded-full bg-pitch-100 border-4 border-pitch-400 flex items-center justify-center mx-auto mb-5">
          <FiCheck className="text-pitch-700 text-4xl" />
        </div>
        <h2 className="text-2xl font-black text-ink-900 mb-1">Booking Confirmed!</h2>
        <p className="text-ink-500 text-sm mb-6">
          {slots.length > 1
            ? `${slots.length} slots reserved successfully.`
            : 'Your slot has been reserved successfully.'}
        </p>

        {/* Booking details */}
        <div className="bg-pitch-50 border border-pitch-200 rounded-xl p-4 space-y-3 text-sm text-left mb-6">
          <div className="flex items-center justify-between">
            <span className="text-ink-500 flex items-center gap-1.5"><FiCalendar className="text-pitch-600 text-xs" /> Date</span>
            <span className="font-bold text-ink-900">{booking.date}</span>
          </div>

          {/* Single slot */}
          {slots.length === 1 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 flex items-center gap-1.5"><FiClock className="text-pitch-600 text-xs" /> Slot</span>
                <span className="font-bold text-ink-900">{booking.timeSlot}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 flex items-center gap-1.5"><FiBox className="text-pitch-600 text-xs" /> Box</span>
                <span className="font-bold text-pitch-700">{booking.box?.name || 'Box 1'}</span>
              </div>
            </>
          )}

          {/* Multiple slots */}
          {slots.length > 1 && (
            <div className="space-y-2">
              <span className="text-ink-500 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <FiClock className="text-pitch-600 text-xs" /> Booked Slots
              </span>
              {slots.map((s, i) => (
                <div key={i} className="flex items-center justify-between pl-2 border-l-2 border-pitch-300">
                  <span className="font-semibold text-ink-900">{s.timeSlot}</span>
                  <span className="text-xs font-bold text-pitch-700 flex items-center gap-1">
                    <FiBox className="text-xs" /> {s.box?.name || 'Box 1'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-pitch-200 pt-3">
            <span className="text-ink-500">Total Paid</span>
            <span className="font-black text-pitch-700 text-lg">&#8377;{totalPaid}</span>
          </div>
        </div>

        <p className="text-xs text-ink-400 mb-5">
          Please arrive 10 minutes early. Show this confirmation at the turf.
        </p>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-pitch-700 text-pitch-700 hover:bg-pitch-700 hover:text-white transition-all duration-200">
            Stay Here
          </button>
          <button onClick={() => { onClose(); window.location.href = '/bookings'; }}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-pitch-700 to-pitch-600 text-white hover:from-pitch-800 hover:to-pitch-700 transition-all duration-200 shadow-md">
            My Bookings
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function TurfDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [turf, setTurf] = useState(null);
  const [boxes, setBoxes] = useState([]);          // all boxes for this turf
  const [allSlots, setAllSlots] = useState([]);    // unique slots across all boxes
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState([]); // multi-select
  const [availability, setAvailability] = useState({}); // slot -> { total, booked, available }
  const [slotLocks, setSlotLocks] = useState({}); // slot -> expiresAt (ms) for slots locked by others
  const [lockCounters, setLockCounters] = useState({}); // slot -> seconds remaining
  const [booking, setBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null); // show modal
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [waitlist, setWaitlist] = useState(new Set()); // slots user is waiting on
  const lockPollRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => { fetchTurf(); }, [id]);
  useEffect(() => { if (turf) { fetchBoxes(); } }, [turf]);

  // Load user's waitlist for this turf+date
  const fetchWaitlist = useCallback(async () => {
    if (!user) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    try {
      const { data } = await api.get('/bookings/waitlist', { params: { turfId: id, date: dateStr } });
      setWaitlist(new Set(data.map(e => e.slot)));
    } catch { /* non-critical */ }
  }, [id, user, selectedDate]);
  const fetchSlotLocks = useCallback(async () => {
    if (!turf) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    try {
      const { data } = await api.get('/bookings/locks', { params: { turfId: id, date: dateStr } });
      setSlotLocks(data);
    } catch {
      // non-critical — ignore
    }
  }, [id, turf, selectedDate]);

  useEffect(() => {
    if (boxes.length) {
      fetchAvailability();
      fetchSlotLocks();
      fetchWaitlist();
    }
  }, [selectedDate, boxes]);

  // Poll slot locks every 15 seconds
  useEffect(() => {
    if (!turf) return;
    lockPollRef.current = setInterval(fetchSlotLocks, 15000);
    return () => clearInterval(lockPollRef.current);
  }, [turf, selectedDate, fetchSlotLocks]);

  // Countdown ticker — updates every second
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      const now = Date.now();
      setLockCounters(prev => {
        const next = {};
        for (const [slot, expiresAt] of Object.entries(slotLocks)) {
          const secs = Math.max(0, Math.ceil((expiresAt - now) / 1000));
          if (secs > 0) next[slot] = secs;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [slotLocks]);

  // Release all held locks when date changes or component unmounts
  useEffect(() => {
    return () => {
      if (!user || !selectedSlots.length) return;
      const dateStr = selectedDate.toISOString().split('T')[0];
      selectedSlots.forEach(slot => {
        api.delete('/bookings/lock', { data: { turfId: id, date: dateStr, timeSlot: slot } }).catch(() => {});
      });
    };
  }, [selectedDate]);

  const fetchTurf = async () => {
    try {
      const { data } = await api.get(`/turfs/${id}`);
      setTurf(data);
    } catch {
      toast.error('Turf not found');
      navigate('/turfs');
    } finally {
      setLoading(false);
    }
  };

  const fetchBoxes = async () => {
    try {
      const { data } = await api.get(`/turfs/${id}/boxes`);
      setBoxes(data);
      // Collect all unique slots across all boxes, sorted
      const slots = [...new Set(data.flatMap(b => b.timeSlots))].sort();
      setAllSlots(slots);
    } catch {
      // fallback to turf-level slots if boxes API fails
      setAllSlots(turf?.timeSlots || []);
    }
  };

  const fetchAvailability = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    try {
      const { data } = await api.get(`/turfs/${id}/availability`, { params: { date: dateStr } });
      setAvailability(data);
    } catch {
      // fallback: mark nothing as booked
      const fallback = {};
      allSlots.forEach(s => { fallback[s] = { total: 1, booked: 0, available: 1 }; });
      setAvailability(fallback);
    }
  };

  const toggleSlot = async (slot) => {
    const isSelected = selectedSlots.includes(slot);
    const dateStr = selectedDate.toISOString().split('T')[0];

    if (isSelected) {
      // Deselect — release lock
      setSelectedSlots(prev => prev.filter(s => s !== slot));
      if (user) {
        try { await api.delete('/bookings/lock', { data: { turfId: id, date: dateStr, timeSlot: slot } }); } catch {}
      }
    } else {
      // Select — try to acquire lock first
      if (user) {
        try {
          await api.post('/bookings/lock', { turfId: id, date: dateStr, timeSlot: slot });
          setSelectedSlots(prev => [...prev, slot]);
        } catch (err) {
          const msg = err.response?.data?.message || 'Slot is held by another user';
          toast.error(`⏳ ${msg}`);
          fetchSlotLocks(); // refresh lock display
        }
      } else {
        // Not logged in — just select visually, lock will be checked at booking time
        setSelectedSlots(prev => [...prev, slot]);
      }
    }
  };

  const handleBook = async () => {
    if (!user) return navigate('/login');
    if (!selectedSlots.length) return toast.error('Please select at least one time slot');
    setBooking(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      // Book each slot sequentially — each gets its own box assignment
      const results = [];
      for (const slot of selectedSlots) {
        const { data } = await api.post('/bookings', { turfId: id, date: dateStr, timeSlot: slot });
        results.push(data);
      }
      // Show modal with summary of all booked slots
      setConfirmedBooking({ ...results[0], slots: results });
      setSelectedSlots([]);
      fetchAvailability();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const toggleWaitlist = async (slot) => {
    if (!user) return navigate('/login');
    const dateStr = selectedDate.toISOString().split('T')[0];
    const isOn = waitlist.has(slot);
    try {
      if (isOn) {
        await api.delete('/bookings/waitlist', { data: { turfId: id, date: dateStr, timeSlot: slot } });
        setWaitlist(prev => { const n = new Set(prev); n.delete(slot); return n; });
        toast.success('Removed from waitlist');
      } else {
        await api.post('/bookings/waitlist', { turfId: id, date: dateStr, timeSlot: slot });
        setWaitlist(prev => new Set([...prev, slot]));
        toast.success("You're on the waitlist! We'll notify you if a slot opens.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update waitlist');
    }
  };

  const handleReview = async (e) => {    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmittingReview(true);
    try {
      await api.post(`/turfs/${id}/reviews`, review);
      toast.success('Review submitted!');
      fetchTurf();
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-ink-50">
      <div className="w-10 h-10 border-2 border-pitch-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!turf) return null;

  const images = turf.images?.length ? turf.images : [PLACEHOLDER];

  return (
    <>
      {/* Booking success modal */}
      <AnimatePresence>
        {confirmedBooking && (
          <BookingSuccessModal
            booking={confirmedBooking}
            onClose={() => setConfirmedBooking(null)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen pt-20 pb-16 px-4 bg-ink-50">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-ink-500 hover:text-pitch-700 mb-6 transition-colors text-sm font-medium">
            <FiArrowLeft /> Back to turfs
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Gallery */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden shadow-sm">
                <div className="relative h-72 sm:h-96">
                  <img src={images[activeImg]} alt={turf.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 mt-2 px-1">
                    {images.map((img, i) => (
                      <button key={i} onClick={() => setActiveImg(i)}
                        className="w-16 h-12 rounded-xl overflow-hidden transition-all duration-200"
                        style={{ border: i === activeImg ? '2px solid #2E7D32' : '2px solid #E5E7EB' }}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Info */}
              <motion.div initial="hidden" animate="visible" variants={staggerContainer}
                className="card p-6 space-y-5">
                <motion.div variants={fadeUp}>
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="text-2xl font-black text-ink-900">{turf.name}</h1>
                      <div className="flex items-center gap-1.5 mt-1.5 text-ink-500 text-sm">
                        <FiMapPin className="text-pitch-600 text-xs" />
                        <span>{turf.location}, {turf.city}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {turf.slotPricing && Object.keys(turf.slotPricing).length > 0 && (
                        <div className="text-xs text-ink-400 mb-0.5">Starting from</div>
                      )}
                      <div className="text-3xl font-black text-pitch-700">
                        &#8377;{turf.slotPricing && Object.keys(turf.slotPricing).length > 0
                          ? Math.min(...Object.values(turf.slotPricing), turf.pricePerHour)
                          : turf.pricePerHour}
                      </div>
                      <div className="text-xs text-ink-500">per hour / per box</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm bg-gold-100 border border-gold-400">
                    <FiStar className="text-gold-500 text-xs" />
                    <span className="font-semibold text-gold-600">{turf.rating?.toFixed(1) || 'New'}</span>
                    <span className="text-ink-500 text-xs">({turf.numReviews} reviews)</span>
                  </div>
                  {/* Box count badge */}
                  {boxes.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm bg-pitch-50 border border-pitch-200">
                      <FiBox className="text-pitch-600 text-xs" />
                      <span className="font-semibold text-pitch-700">{boxes.length} box{boxes.length !== 1 ? 'es' : ''}</span>
                    </div>
                  )}
                  <a href={`tel:${turf.contactNumber}`}
                    className="flex items-center gap-1.5 text-pitch-700 hover:underline text-sm font-medium">
                    <FiPhone className="text-xs" /> {turf.contactNumber}
                  </a>
                  <a href={`https://wa.me/${turf.contactNumber?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-green-600 hover:underline text-sm font-medium">
                    <FiMessageCircle className="text-xs" /> WhatsApp
                  </a>
                </motion.div>

                {turf.description && (
                  <motion.p variants={fadeUp} className="text-sm text-ink-500 leading-relaxed">{turf.description}</motion.p>
                )}

                {/* Boxes list */}
                {boxes.length > 0 && (
                  <motion.div variants={fadeUp}>
                    <h3 className="font-semibold text-sm text-ink-700 mb-3 flex items-center gap-1.5">
                      <FiBox className="text-pitch-600 text-xs" /> Available Boxes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {boxes.map(b => (
                        <span key={b._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-pitch-50 border border-pitch-200 text-pitch-800">
                          📦 {b.name}
                          <span className="text-pitch-500">· {b.timeSlots.length} slots</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-ink-400 mt-2">
                      A box is auto-assigned when you book. If one box is full, another is used.
                    </p>
                  </motion.div>
                )}

                {turf.amenities?.length > 0 && (
                  <motion.div variants={fadeUp}>
                    <h3 className="font-semibold text-sm text-ink-700 mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {turf.amenities.map(a => (
                        <span key={a} className="badge-green flex items-center gap-1.5">
                          <FiCheck className="text-xs" /> {a}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {turf.mapLink && (
                  <motion.div variants={fadeUp}>
                    <a href={turf.mapLink} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-pitch-700 hover:underline text-sm font-medium">
                      <FiMapPin className="text-xs" /> View on Google Maps
                    </a>
                  </motion.div>
                )}
              </motion.div>

              {/* Reviews */}
              <div className="card p-6">
                <h2 className="text-lg font-bold text-ink-900 mb-5">Reviews</h2>
                {turf.reviews?.length === 0 && (
                  <p className="text-ink-500 text-sm">No reviews yet. Be the first!</p>
                )}
                <div className="space-y-4 mb-6">
                  {turf.reviews?.map((r, i) => (
                    <div key={i} className="pb-4 last:pb-0 border-b last:border-b-0 border-ink-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm text-ink-900">{r.name}</span>
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                      <p className="text-sm text-ink-500">{r.comment}</p>
                    </div>
                  ))}
                </div>
                {user && user.role === 'player' && (
                  <form onSubmit={handleReview} className="space-y-3 pt-4 border-t border-ink-100">
                    <h3 className="font-semibold text-sm text-ink-700">Write a Review</h3>
                    <StarRating rating={review.rating} onRate={r => setReview(v => ({ ...v, rating: r }))} />
                    <textarea value={review.comment} onChange={e => setReview(v => ({ ...v, comment: e.target.value }))}
                      placeholder="Share your experience..." rows={3}
                      className="input-field resize-none text-sm" />
                    <button type="submit" disabled={submittingReview} className="btn-primary text-sm py-2.5 px-6">
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* ── Booking panel ── */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="card p-6 sticky top-24 space-y-5">
                <div className="accent-bar" />
                <h2 className="text-lg font-bold text-ink-900">Book This Turf</h2>

                {/* No boxes warning */}
                {boxes.length === 0 && (
                  <div className="rounded-xl p-3 bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
                    ⚠️ No boxes configured yet. The owner needs to add boxes before bookings can be made.
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Select Date</label>
                  <DatePicker selected={selectedDate} onChange={(d) => { setSelectedDate(d); setSelectedSlots([]); }}
                    minDate={new Date()} dateFormat="dd/MM/yyyy"
                    className="input-field w-full cursor-pointer text-sm"
                    wrapperClassName="w-full" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <FiClock className="text-pitch-600 text-xs" /> Select Slots
                  </label>
                  <p className="text-xs text-ink-400 mb-2">Tap multiple slots to book 2–3 hours</p>

                  {allSlots.length === 0 ? (
                    <p className="text-ink-400 text-sm italic">No slots available. Add boxes with time slots first.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {allSlots.map(slot => {
                        const info = availability[slot];
                        const avail = info ? info.available : 0;
                        const total = info ? info.total : 0;
                        const isFullyBooked = avail === 0 && total > 0;
                        const isSelected = selectedSlots.includes(slot);
                        const lockSecsRemaining = lockCounters[slot];
                        const isLockedByOther = !isSelected && lockSecsRemaining > 0;

                        const lockMins = lockSecsRemaining ? Math.floor(lockSecsRemaining / 60) : 0;
                        const lockSecs = lockSecsRemaining ? lockSecsRemaining % 60 : 0;
                        const lockLabel = lockSecsRemaining
                          ? `${lockMins}:${String(lockSecs).padStart(2, '0')}`
                          : null;

                        // Per-slot price
                        const slotPrice = turf.slotPricing?.[slot] || turf.pricePerHour;
                        const isWaiting = waitlist.has(slot);

                        return (
                          <button key={slot}
                            disabled={isLockedByOther}
                            onClick={() => isFullyBooked ? toggleWaitlist(slot) : toggleSlot(slot)}
                            className="py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-200 text-left"
                            style={{
                              background: isFullyBooked ? (isWaiting ? '#FFF7ED' : '#FEF2F2') : isLockedByOther ? '#FFF7ED' : isSelected ? '#2E7D32' : '#F9FAFB',
                              border: isFullyBooked ? (isWaiting ? '1px solid #FED7AA' : '1px solid #FECACA') : isLockedByOther ? '1px solid #FED7AA' : isSelected ? '1px solid #2E7D32' : '1px solid #E5E7EB',
                              color: isFullyBooked ? (isWaiting ? '#C2410C' : '#EF4444') : isLockedByOther ? '#C2410C' : isSelected ? '#fff' : '#374151',
                              cursor: isLockedByOther ? 'not-allowed' : 'pointer',
                            }}>
                            <div className="font-semibold flex items-center gap-1">
                              {isLockedByOther && <FiLock style={{ fontSize: '10px' }} />}
                              {isSelected ? '✓ ' : ''}{slot}
                            </div>
                            <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.85 }}>
                              {isFullyBooked
                                ? (isWaiting ? '🔔 On waitlist — tap to remove' : '🔴 Full — tap to join waitlist')
                                : isLockedByOther
                                  ? `🔒 Held — free in ${lockLabel}`
                                  : `🟢 ${avail} of ${total} box${total !== 1 ? 'es' : ''} free`}
                            </div>
                            <div style={{ fontSize: '10px', marginTop: '1px', fontWeight: 600, opacity: isFullyBooked ? 0.5 : 1 }}>
                              &#8377;{slotPrice}/hr
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Summary */}
                {selectedSlots.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-4 space-y-2.5 text-sm bg-pitch-50 border border-pitch-200">
                    <div className="flex justify-between text-ink-500">
                      <span>Date</span>
                      <span className="text-ink-900 font-semibold">{selectedDate.toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-ink-500 text-xs">Slots ({selectedSlots.length}h)</span>
                      {selectedSlots.map(s => {
                        const slotPrice = turf.slotPricing?.[s] || turf.pricePerHour;
                        return (
                          <div key={s} className="flex justify-between pl-2 border-l-2 border-pitch-300">
                            <span className="text-ink-700 font-medium">{s}</span>
                            <span className="text-ink-500">&#8377;{slotPrice}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-pitch-200">
                      <span className="text-ink-900">Total</span>
                      <span className="text-pitch-700 text-base">
                        &#8377;{selectedSlots.reduce((sum, s) => sum + (turf.slotPricing?.[s] || turf.pricePerHour), 0)}
                      </span>
                    </div>
                  </motion.div>
                )}

                <motion.button onClick={handleBook} disabled={booking || !selectedSlots.length || boxes.length === 0}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pitch-700 to-pitch-600 text-white hover:from-pitch-800 hover:to-pitch-700 transition-all duration-200 shadow-lg shadow-pitch-700/25 disabled:opacity-40 disabled:cursor-not-allowed">
                  {booking
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : selectedSlots.length > 1
                      ? `🏏 Book ${selectedSlots.length} Slots — ₹${selectedSlots.reduce((sum, s) => sum + (turf.slotPricing?.[s] || turf.pricePerHour), 0)}`
                      : '🏏 Confirm Booking'}
                </motion.button>

                {!user && (
                  <p className="text-center text-xs text-ink-500">
                    <a href="/login" className="text-pitch-700 font-semibold hover:underline">Login</a> to book this turf
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
