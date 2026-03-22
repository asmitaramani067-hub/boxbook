import { GiCricketBat } from 'react-icons/gi';
import { FiInstagram, FiTwitter, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-pitch-900 py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pitch-700 flex items-center justify-center">
            <GiCricketBat className="text-white text-lg" />
          </div>
          <span className="text-xl font-black text-white">Box<span className="text-gold-400">Book</span></span>
        </div>
        <p className="text-sm text-pitch-400">
          &copy; 2025 BoxBook. Book your game, own the field.
        </p>
        <div className="flex gap-3">
          {[FiInstagram, FiTwitter, FiMail].map((Icon, i) => (
            <button key={i}
              className="p-2 rounded-xl text-pitch-400 hover:text-white hover:bg-pitch-700 transition-all duration-200 border border-pitch-700">
              <Icon />
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
