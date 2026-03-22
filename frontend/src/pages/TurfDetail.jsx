import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiStar, FiClock, FiArrowLeft, FiMessageCircle } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StarRating from '../components/StarRating';
import { fadeUp, staggerContainer } from '../animations/variants';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80';

export default function TurfDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dark } = useTheme();
  const subText = dark ? 'text-gray-400' : 'text-gray-500';
  const bodyText = dark ? 'text-gray-300' : 'text-gray-700';
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [booking, setBooking] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchTurf();
  }, [id]);

  useEffect(() => {
    if (turf) fetchBookedSlots();
  }, [selectedDate, turf]);

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
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-neon border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!turf) return null;

  const images = turf.images?.length ? turf.images : [PLACEHOLDER];

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className={`flex items-center gap-2 hover:text-neon mb-6 transition-colors ${subText}`}>
          <FiArrowLeft /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden">
              <div className="relative h-72 sm:h-96">
                <img src={images[activeImg]} alt={turf.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-neon' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Turf info */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="glass rounded-2xl p-6 space-y-4">
              <motion.div variants={fadeUp}>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-2xl font-black">{turf.name}</h1>
                    <div className={`flex items-center gap-1 mt-1 ${subText}`}>
                      <FiMapPin className="text-neon" />
                      <span>{turf.location}, {turf.city}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-neon">₹{turf.pricePerHour}</div>
                    <div className="text-xs text-gray-400">per hour</div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <FiStar className="text-yellow-400" />
                  <span className="font-semibold">{turf.rating?.toFixed(1) || 'New'}</span>
                  <span className={`text-sm ${subText}`}>({turf.numReviews} reviews)</span>
                </div>
                <a href={`tel:${turf.contactNumber}`}
                  className="flex items-center gap-1 text-neon hover:underline">
                  <FiPhone /> {turf.contactNumber}
                </a>
                <a href={`https://wa.me/${turf.contactNumber?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-green-400 hover:underline text-sm">
                  <FiMessageCircle /> WhatsApp
                </a>
              </motion.div>

              {turf.description && (
                <motion.p variants={fadeUp} className={`text-sm leading-relaxed ${bodyText}`}>{turf.description}</motion.p>
              )}

              {turf.amenities?.length > 0 && (
                <motion.div variants={fadeUp}>
                  <h3 className="font-semibold mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {turf.amenities.map(a => (
                      <span key={a} className="text-sm bg-neon/10 text-neon px-3 py-1 rounded-full border border-neon/20">{a}</span>
                    ))}
                  </div>
                </motion.div>
              )}

              {turf.mapLink && (
                <motion.div variants={fadeUp}>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <a href={turf.mapLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-neon hover:underline text-sm">
                    <FiMapPin /> View on Google Maps
                  </a>
                </motion.div>
              )}
            </motion.div>

            {/* Reviews */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Reviews</h2>
              {turf.reviews?.length === 0 && <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>}
              <div className="space-y-4 mb-6">
                {turf.reviews?.map((r, i) => (
                  <div key={i} className={`border-b pb-4 last:border-0 ${dark ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{r.name}</span>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    <p className={`text-sm ${subText}`}>{r.comment}</p>
                  </div>
                ))}
              </div>

              {user && user.role === 'player' && (
                <form onSubmit={handleReview} className={`space-y-3 border-t pt-4 ${dark ? 'border-white/10' : 'border-gray-200'}`}>
                  <h3 className="font-semibold">Write a Review</h3>
                  <StarRating rating={review.rating} onRate={r => setReview(v => ({ ...v, rating: r }))} />
                  <textarea value={review.comment} onChange={e => setReview(v => ({ ...v, comment: e.target.value }))}
                    placeholder="Share your experience..." rows={3}
                    className="input-field resize-none" />
                  <button type="submit" disabled={submittingReview} className="btn-primary text-sm py-2">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Booking panel */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 sticky top-24 space-y-5">
              <h2 className="text-xl font-bold">Book This Turf</h2>

              <div>
                <label className={`text-sm mb-2 block ${subText}`}>Select Date</label>
                <DatePicker selected={selectedDate} onChange={setSelectedDate}
                  minDate={new Date()} dateFormat="dd/MM/yyyy"
                  className="input-field w-full cursor-pointer"
                  wrapperClassName="w-full" />
              </div>

              <div>
                <label className={`text-sm mb-2 block flex items-center gap-1 ${subText}`}>
                  <FiClock className="text-neon" /> Available Slots
                </label>
                {turf.timeSlots?.length === 0 ? (
                  <p className="text-gray-500 text-sm">No slots configured</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {turf.timeSlots?.map(slot => {
                      const booked = bookedSlots.includes(slot);
                      return (
                        <button key={slot} disabled={booked} onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                            booked ? 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed' :
                            selectedSlot === slot ? 'bg-neon text-black border border-neon' :
                            'glass hover:border-neon/50 hover:text-neon'
                          }`}>
                          {booked ? '🔴 ' : ''}{slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedSlot && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-neon/5 border border-neon/20 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date</span>
                    <span>{selectedDate.toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Slot</span>
                    <span>{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-neon">₹{turf.pricePerHour}</span>
                  </div>
                </motion.div>
              )}

              <motion.button onClick={handleBook} disabled={booking || !selectedSlot}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {booking ? <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Confirm Booking'}
              </motion.button>

              {!user && (
                <p className="text-center text-xs text-gray-400">
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
