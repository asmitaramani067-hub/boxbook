import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiStar, FiClock, FiArrowLeft, FiMessageCircle, FiCheck } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { fadeUp, staggerContainer } from '../animations/variants';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80';

export default function TurfDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [booking, setBooking] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => { fetchTurf(); }, [id]);
  useEffect(() => { if (turf) fetchBookedSlots(); }, [selectedDate, turf]);

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

  const fetchBookedSlots = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const { data } = await api.get('/bookings/slots', { params: { turfId: id, date: dateStr } });
    setBookedSlots(data);
  };

  const handleBook = async () => {
    if (!user) return navigate('/login');
    if (!selectedSlot) return toast.error('Please select a time slot');
    setBooking(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await api.post('/bookings', { turfId: id, date: dateStr, timeSlot: selectedSlot });
      toast.success('Booking confirmed!');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
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
    <div className="min-h-screen pt-20 flex items-center justify-center bg-dark-900">
      <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!turf) return null;

  const images = turf.images?.length ? turf.images : [PLACEHOLDER];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-dark-900">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors text-sm">
          <FiArrowLeft /> Back to turfs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden">
              <div className="relative h-72 sm:h-96">
                <img src={images[activeImg]} alt={turf.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className="w-16 h-12 rounded-xl overflow-hidden transition-all duration-200"
                      style={{ border: i === activeImg ? '2px solid #39FF14' : '2px solid transparent' }}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}
              className="rounded-2xl p-6 space-y-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <motion.div variants={fadeUp}>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-2xl font-black text-white">{turf.name}</h1>
                    <div className="flex items-center gap-1.5 mt-1.5 text-gray-500 text-sm">
                      <FiMapPin className="text-neon text-xs" />
                      <span>{turf.location}, {turf.city}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-neon" style={{ textShadow: '0 0 20px rgba(57,255,20,0.4)' }}>
                      &#8377;{turf.pricePerHour}
                    </div>
                    <div className="text-xs text-gray-500">per hour</div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm"
                  style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
                  <FiStar className="text-yellow-400 text-xs" />
                  <span className="font-semibold text-yellow-400">{turf.rating?.toFixed(1) || 'New'}</span>
                  <span className="text-gray-500 text-xs">({turf.numReviews} reviews)</span>
                </div>
                <a href={`tel:${turf.contactNumber}`}
                  className="flex items-center gap-1.5 text-neon hover:underline text-sm">
                  <FiPhone className="text-xs" /> {turf.contactNumber}
                </a>
                <a href={`https://wa.me/${turf.contactNumber?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-green-400 hover:underline text-sm">
                  <FiMessageCircle className="text-xs" /> WhatsApp
                </a>
              </motion.div>

              {turf.description && (
                <motion.p variants={fadeUp} className="text-sm text-gray-400 leading-relaxed">{turf.description}</motion.p>
              )}

              {turf.amenities?.length > 0 && (
                <motion.div variants={fadeUp}>
                  <h3 className="font-semibold text-sm text-gray-300 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {turf.amenities.map(a => (
                      <span key={a} className="flex items-center gap-1.5 text-sm text-neon px-3 py-1.5 rounded-xl"
                        style={{ background: 'rgba(57,255,20,0.07)', border: '1px solid rgba(57,255,20,0.15)' }}>
                        <FiCheck className="text-xs" /> {a}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {turf.mapLink && (
                <motion.div variants={fadeUp}>
                  <a href={turf.mapLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-neon hover:underline text-sm">
                    <FiMapPin className="text-xs" /> View on Google Maps
                  </a>
                </motion.div>
              )}
            </motion.div>

            {/* Reviews */}
            <div className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-lg font-bold text-white mb-5">Reviews</h2>
              {turf.reviews?.length === 0 && (
                <p className="text-gray-600 text-sm">No reviews yet. Be the first!</p>
              )}
              <div className="space-y-4 mb-6">
                {turf.reviews?.map((r, i) => (
                  <div key={i} className="pb-4 last:pb-0" style={{ borderBottom: i < turf.reviews.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm text-white">{r.name}</span>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    <p className="text-sm text-gray-500">{r.comment}</p>
                  </div>
                ))}
              </div>

              {user && user.role === 'player' && (
                <form onSubmit={handleReview} className="space-y-3 pt-4"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <h3 className="font-semibold text-sm text-gray-300">Write a Review</h3>
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

          {/* Booking panel */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl p-6 sticky top-24 space-y-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-lg font-bold text-white">Book This Turf</h2>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Select Date</label>
                <DatePicker selected={selectedDate} onChange={setSelectedDate}
                  minDate={new Date()} dateFormat="dd/MM/yyyy"
                  className="input-field w-full cursor-pointer text-sm"
                  wrapperClassName="w-full" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FiClock className="text-neon text-xs" /> Available Slots
                </label>
                {turf.timeSlots?.length === 0 ? (
                  <p className="text-gray-600 text-sm">No slots configured</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {turf.timeSlots?.map(slot => {
                      const booked = bookedSlots.includes(slot);
                      return (
                        <button key={slot} disabled={booked} onClick={() => setSelectedSlot(slot)}
                          className="py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-200"
                          style={{
                            background: booked ? 'rgba(239,68,68,0.07)' : selectedSlot === slot ? '#39FF14' : 'rgba(255,255,255,0.04)',
                            border: booked ? '1px solid rgba(239,68,68,0.2)' : selectedSlot === slot ? '1px solid #39FF14' : '1px solid rgba(255,255,255,0.08)',
                            color: booked ? '#f87171' : selectedSlot === slot ? '#000' : '#9ca3af',
                            cursor: booked ? 'not-allowed' : 'pointer',
                          }}>
                          {booked ? '🔴 ' : ''}{slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedSlot && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-4 space-y-2 text-sm"
                  style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.15)' }}>
                  <div className="flex justify-between text-gray-400">
                    <span>Date</span>
                    <span className="text-white">{selectedDate.toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Slot</span>
                    <span className="text-white">{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1" style={{ borderTop: '1px solid rgba(57,255,20,0.1)' }}>
                    <span className="text-white">Total</span>
                    <span className="text-neon">&#8377;{turf.pricePerHour}</span>
                  </div>
                </motion.div>
              )}

              <motion.button onClick={handleBook} disabled={booking || !selectedSlot}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40">
                {booking
                  ? <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  : 'Confirm Booking'}
              </motion.button>

              {!user && (
                <p className="text-center text-xs text-gray-600">
                  <a href="/login" className="text-neon hover:underline">Login</a> to book this turf
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
