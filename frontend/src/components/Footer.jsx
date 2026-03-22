import { GiCricketBat } from 'react-icons/gi';
import { FiInstagram, FiTwitter, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="mt-20 py-10 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.2)' }}>
            <GiCricketBat className="text-neon text-base" />
          </div>
          <span className="text-xl font-black text-white">Box<span className="text-neon">Book</span></span>
        </div>
        <p className="text-sm text-gray-600">
          &copy; 2025 BoxBook. Book your game, own the field.
        </p>
        <div className="flex gap-3">
          {[FiInstagram, FiTwitter, FiMail].map((Icon, i) => (
            <button key={i}
              className="p-2 rounded-xl text-gray-600 hover:text-neon transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(57,255,20,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
              <Icon />
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
