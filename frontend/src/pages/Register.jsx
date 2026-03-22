import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
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

  const roles = [
    { value: 'player', label: 'Player', icon: GiCricketBat, desc: 'Find & book turfs' },
    { value: 'owner', label: 'Turf Owner', icon: MdSportsCricket, desc: 'List & manage turfs' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-10 bg-dark-900">
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(57,255,20,0.06) 0%, transparent 70%)' }} />

      <motion.div initial="hidden" animate="visible" variants={staggerContainer}
        className="w-full max-w-md relative z-10">

        <motion.div variants={fadeUp} className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.2)' }}>
            <GiCricketBat className="text-neon text-2xl" />
          </div>
          <h1 className="text-3xl font-black text-white">Join BoxBook</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Create your account and start playing</p>
        </motion.div>

        <motion.form variants={fadeUp} onSubmit={handleSubmit}
          className="rounded-2xl p-8 space-y-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Role selector */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(r => (
                <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))}
                  className="p-4 rounded-xl text-left transition-all duration-200"
                  style={{
                    border: form.role === r.value ? '1.5px solid rgba(57,255,20,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    background: form.role === r.value ? 'rgba(57,255,20,0.07)' : 'rgba(255,255,255,0.02)',
                  }}>
                  <r.icon className={`text-xl mb-1.5 ${form.role === r.value ? 'text-neon' : 'text-gray-500'}`} />
                  <p className={`font-semibold text-sm ${form.role === r.value ? 'text-white' : 'text-gray-400'}`}>{r.label}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {[
            { label: 'Full Name', key: 'name', icon: FiUser, type: 'text', placeholder: 'Your name' },
            { label: 'Email', key: 'email', icon: FiMail, type: 'email', placeholder: 'you@example.com' },
            { label: 'Phone', key: 'phone', icon: FiPhone, type: 'tel', placeholder: '+91 98765 43210' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">{f.label}</label>
              <div className="relative">
                <f.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input type={f.type} required={f.key !== 'phone'} value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="input-field pl-11 text-sm" />
              </div>
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input type={showPass ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min 6 characters"
                className="input-field pl-11 pr-11 text-sm" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                {showPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
          </div>

          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
            {loading
              ? <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : <><span>Create Account</span><FiArrowRight className="text-sm" /></>}
          </motion.button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-neon hover:underline font-semibold">Sign in</Link>
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
}
