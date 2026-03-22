import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { fadeUp, staggerContainer } from '../animations/variants';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name?.split(' ')[0] || 'Player'}!`);
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/turfs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 bg-dark-900">
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(57,255,20,0.06) 0%, transparent 70%)' }} />

      <motion.div initial="hidden" animate="visible" variants={staggerContainer}
        className="w-full max-w-md relative z-10">

        <motion.div variants={fadeUp} className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.2)' }}>
            <GiCricketBat className="text-neon text-2xl" />
          </div>
          <h1 className="text-3xl font-black text-white">Welcome back</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Sign in to your BoxBook account</p>
        </motion.div>

        <motion.form variants={fadeUp} onSubmit={handleSubmit}
          className="rounded-2xl p-8 space-y-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Email</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="input-field pl-11 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input type={showPass ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="input-field pl-11 pr-11 text-sm" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                {showPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
          </div>

          <motion.button type="submit" disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
            {loading
              ? <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : <><span>Sign In</span><FiArrowRight className="text-sm" /></>}
          </motion.button>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-neon hover:underline font-semibold">Sign up free</Link>
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
}
