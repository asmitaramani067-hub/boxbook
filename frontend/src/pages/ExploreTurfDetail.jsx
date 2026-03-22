import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiStar, FiClock, FiArrowLeft, FiMessageCircle, FiCheck, FiExternalLink } from 'react-icons/fi';
import { EXPLORE_TURFS } from '../data/exploreTurfs';
import { fadeUp, staggerContainer } from '../animations/variants';

export default function ExploreTurfDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const turf = EXPLORE_TURFS.find(t => t.id === id);

  if (!turf) return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-ink-50">
      <div className="text-center">
        <p className="text-5xl mb-4">🏏</p>
        <h2 className="text-xl font-bold text-ink-900 mb-2">Venue not found</h2>
        <button onClick={() => navigate('/explore')} className="btn-primary mt-2">Back to Explore</button>
      </div>
    </div>
  );

  const waMsg = encodeURIComponent(`Hi! I found your cricket venue "${turf.name}" on PitchUp. I'd like to book a slot. Please share availability.`);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-ink-50">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/explore')}
          className="flex items-center gap-2 text-ink-500 hover:text-pitch-700 mb-6 transition-colors text-sm font-medium">
          <FiArrowLeft /> Back to Explore
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-2xl overflow-hidden shadow-sm relative h-72 sm:h-96">
              <img src={turf.image} alt={turf.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <span className="absolute top-4 right-4 badge-gold">Not on PitchUp</span>
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
                      <span>{turf.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-pitch-700">{turf.price}</div>
                    <div className="text-xs text-ink-500">approx. per hour</div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm bg-gold-100 border border-gold-400">
                  <FiStar className="text-gold-500 text-xs" />
                  <span className="font-semibold text-gold-600">{turf.rating}</span>
                  <span className="text-ink-500 text-xs">({turf.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-ink-500">
                  <FiClock className="text-pitch-600 text-xs" />
                  <span>{turf.openHours}</span>
                </div>
              </motion.div>

              {turf.description && (
                <motion.p variants={fadeUp} className="text-sm text-ink-500 leading-relaxed">{turf.description}</motion.p>
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

              <motion.div variants={fadeUp}
                className="rounded-xl p-4 bg-gold-50 border border-gold-400 text-sm text-gold-600">
                <strong>Note:</strong> This venue is not yet on PitchUp. Contact them directly to book a slot.
              </motion.div>
            </motion.div>
          </div>

          {/* Contact panel */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="card p-6 sticky top-24 space-y-4">
              <div className="accent-bar" />
              <h2 className="text-lg font-bold text-ink-900">Contact This Venue</h2>
              <p className="text-sm text-ink-500">Reach out directly to check availability and book your slot.</p>

              <a href={`tel:${turf.phone}`}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                <FiPhone /> Call Now
              </a>

              <a href={`https://wa.me/${turf.whatsapp}?text=${waMsg}`}
                target="_blank" rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 text-white"
                style={{ background: '#25D366' }}>
                <FiMessageCircle /> WhatsApp
              </a>

              {turf.mapLink && (
                <a href={turf.mapLink} target="_blank" rel="noreferrer"
                  className="btn-outline w-full flex items-center justify-center gap-2 text-sm">
                  <FiExternalLink /> View on Maps
                </a>
              )}

              <div className="pt-3 border-t border-ink-100 space-y-2 text-sm text-ink-500">
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-pitch-600 flex-shrink-0" />
                  <span>{turf.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="text-pitch-600 flex-shrink-0" />
                  <span>{turf.openHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="text-pitch-600 flex-shrink-0" />
                  <span>{turf.phone}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
