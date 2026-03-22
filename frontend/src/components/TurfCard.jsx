import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiClock, FiPhone } from 'react-icons/fi';
import { fadeUp } from '../animations/variants';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80';

export default function TurfCard({ turf }) {
  const img = turf.images?.[0] ? turf.images[0] : PLACEHOLDER;

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -8 }} className="glass rounded-2xl overflow-hidden card-hover group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img src={img} alt={turf.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 right-3 glass px-2 py-1 rounded-lg flex items-center gap-1">
          <FiStar className="text-yellow-400 text-xs" />
          <span className="text-xs font-semibold">{turf.rating?.toFixed(1) || 'New'}</span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="text-2xl font-black text-neon">₹{turf.pricePerHour}</span>
          <span className="text-xs text-gray-300">/hr</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 truncate">{turf.name}</h3>
        <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
          <FiMapPin className="text-neon flex-shrink-0" />
          <span className="truncate">{turf.location}, {turf.city}</span>
        </div>

        {turf.timeSlots?.length > 0 && (
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
            <FiClock className="text-neon" />
            <span>{turf.timeSlots.length} slots available</span>
          </div>
        )}

        {turf.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {turf.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-xs bg-neon/10 text-neon px-2 py-0.5 rounded-full border border-neon/20">{a}</span>
            ))}
          </div>
        )}

        <Link to={`/turfs/${turf._id}`}
          className="block w-full text-center btn-primary text-sm py-2.5 mt-2">
          View & Book
        </Link>
      </div>
    </motion.div>
  );
}
