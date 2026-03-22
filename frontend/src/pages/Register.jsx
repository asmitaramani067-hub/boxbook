import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';
import { MdSportsCricket } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { fadeUp, staggerContainer } from '../animations/variants';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'player' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to BoxBook, ${user.name?.split(' ')[0] || 'Player'}!`);
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/turfs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.05),transparent_70%)]" />
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="w-full max-w-md relative z-10">
        <motion.div variants={fadeUp} className="text-center mb-8">
          <GiCricketBat className="text-neon text-4xl mx-auto mb-3" />
          <h1 className="text-3xl font-black">Join BoxBook</h1>
          <p className="text-gray-400 mt-1">Create your account and start playing</p>
        </motion.div>

        <motion.form variants={fadeUp} onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
          {/* Role selector */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'player', label: 'Player', icon: GiCricketBat, desc: 'Book turfs' },
                { value: 'owner', label: 'Turf Owner', icon: MdSportsCricket, desc: 'List turfs' },
              ].map(r => (
                <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${form.role === r.value ? 'border-neon bg-neon/10' : 'border-white/10 hover:border-white/30'}`}>
                  <r.icon className={`text-xl mb-1 ${form.role === r.value ? 'text-neon' : 'text-gray-400'}`} />
                  <p className="font-semibold text-sm">{r.label}</p>
                  <p className="text-xs text-gray-400">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name" className="input-field pl-11" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com" className="input-field pl-11" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210" className="input-field pl-11" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPass ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min 6 characters" className="input-field pl-11 pr-11" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Create Account'}
          </motion.button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-neon hover:underline font-medium">Sign in</Link>
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
}
