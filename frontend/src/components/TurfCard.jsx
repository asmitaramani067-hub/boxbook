import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiClock, FiArrowRight } from 'react-icons/fi';
import { fadeUp } from '../animations/variants';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80';

export default function TurfCard({ turf }) {
  const img = turf.images?.[0] ? turf.images[0] : PLACEHOLDER;

  return (
    <motion.div variants={fadeUp} className="card card-hover overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <img src={img} alt={turf.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 text-ink-800 shadow-sm">
          <FiStar className="text-gold-500" />
          <span>{turf.rating?.toFixed(1) || 'New'}</span>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="text-2xl font-black text-white">&#8377;{turf.pricePerHour}</span>
          <span className="text-xs text-gray-300 ml-1">/hr</span>
        </div>

        {turf.timeSlots?.length > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-white px-2 py-1 rounded-lg bg-black/50">
            <FiClock className="text-pitch-300 text-xs" />
            {turf.timeSlots.length} slots
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-base mb-1.5 text-ink-900 truncate">{turf.name}</h3>

        <div className="flex items-center gap-1.5 text-sm text-ink-500 mb-3">
          <FiMapPin className="text-pitch-600 flex-shrink-0 text-xs" />
          <span className="truncate">{turf.location}, {turf.city}</span>
        </div>

        {turf.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {turf.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-xs px-2 py-0.5 rounded-full text-pitch-700 bg-pitch-50 border border-pitch-200">
                {a}
              </span>
            ))}
            {turf.amenities.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full text-ink-500 bg-ink-100 border border-ink-200">
                +{turf.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <Link to={`/turfs/${turf._id}`}
          className="btn-primary flex items-center justify-center gap-2 w-full py-2.5 text-sm">
          View &amp; Book <FiArrowRight className="text-xs" />
        </Link>
      </div>
    </motion.div>
  );
}
