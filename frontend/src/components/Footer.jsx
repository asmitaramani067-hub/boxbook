import { GiCricketBat } from 'react-icons/gi';
import { FiInstagram, FiTwitter, FiMail } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { dark } = useTheme();
  return (
    <footer className={`border-t mt-20 py-10 px-4 ${dark ? 'border-white/10' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <GiCricketBat className="text-neon text-2xl" />
          <span className="text-xl font-black">Box<span className="text-neon">Book</span></span>
        </div>
        <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
          © 2025 BoxBook. Book your game, own the field.
        </p>
        <div className="flex gap-4">
          {[FiInstagram, FiTwitter, FiMail].map((Icon, i) => (
            <button key={i} className="p-2 glass rounded-lg hover:border-neon/50 hover:text-neon transition-colors">
              <Icon />
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
