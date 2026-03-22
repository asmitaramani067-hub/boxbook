import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiClock, FiArrowRight } from 'react-icons/fi';
import { fadeUp } from '../animations/variants';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80';

export default function TurfCard({ turf }) {
  const img = turf.images?.[0] ? turf.images[0] : PLACEHOLDER;

  return (
    <motion.div
      variants={fadeUp}
      className="group rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      whileHover={{ y: -6 }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(57,255,20,0.2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>

      <div className="relative h-48 overflow-hidden">
        <img src={img} alt={turf.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <FiStar className="text-yellow-400" />
          <span className="text-white">{turf.rating?.toFixed(1) || 'New'}</span>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="text-2xl font-black text-neon" style={{ textShadow: '0 0 20px rgba(57,255,20,0.5)' }}>
            &#8377;{turf.pricePerHour}
          </span>
          <span className="text-xs text-gray-400 ml-1">/hr</span>
        </div>

        {turf.timeSlots?.length > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-gray-300 px-2 py-1 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
            <FiClock className="text-neon text-xs" />
            {turf.timeSlots.length} slots
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-base mb-1.5 text-white truncate">{turf.name}</h3>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <FiMapPin className="text-neon flex-shrink-0 text-xs" />
          <span className="truncate">{turf.location}, {turf.city}</span>
        </div>

        {turf.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {turf.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-xs px-2 py-0.5 rounded-full text-neon"
                style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.15)' }}>
                {a}
              </span>
            ))}
            {turf.amenities.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full text-gray-500"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                +{turf.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <Link to={`/turfs/${turf._id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-black bg-neon transition-all duration-200 hover:bg-green-400"
          style={{ boxShadow: '0 0 15px rgba(57,255,20,0.2)' }}>
          View &amp; Book <FiArrowRight className="text-xs" />
        </Link>
      </div>
    </motion.div>
  );
}
