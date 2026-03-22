import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
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
      toast.success(`Welcome back, ${user.name?.split(' ')[0]}!`);
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/turfs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 pt-16">
      {/* Green header band */}
      <div className="bg-pitch-700 pt-24 pb-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-pitch-700 text-3xl font-black">🏏</span>
        </div>
        <h1 className="text-3xl font-black text-white">Welcome back</h1>
        <p className="text-pitch-200 mt-1.5 text-sm">Sign in to your BoxBook account</p>
      </div>

      <div className="flex justify-center px-4 -mt-8 pb-16">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}
        className="w-full max-w-md">

        <motion.form variants={fadeUp} onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 space-y-5 shadow-xl border border-ink-100">

          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Email</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com" className="input-field pl-11 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
              <input type={showPass ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" className="input-field pl-11 pr-11 text-sm" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors">
                {showPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
          </div>

          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>Sign In</span><FiArrowRight className="text-sm" /></>}
          </motion.button>

          <p className="text-center text-sm text-ink-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-pitch-700 hover:underline font-semibold">Sign up free</Link>
          </p>
        </motion.form>
      </motion.div>
      </div>
    </div>
  );
}
