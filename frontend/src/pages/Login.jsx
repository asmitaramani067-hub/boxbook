import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { fadeUp, staggerContainer } from '../animations/variants';

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="field-error">
      <FiAlertCircle className="text-xs flex-shrink-0" /> {msg}
    </p>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name?.split(' ')[0]}!`);
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/turfs');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (msg.toLowerCase().includes('password')) setErrors({ password: msg });
      else setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  return (
    <div className="min-h-screen bg-ink-50 pt-16">
      {/* Green header band */}
      <div className="bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-700 pt-24 pb-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <span className="text-3xl">🏏</span>
          </div>
          <h1 className="text-3xl font-black text-white">Welcome back</h1>
          <p className="text-pitch-300 mt-1.5 text-sm">Sign in to your PitchUp account</p>
        </motion.div>
      </div>

      <div className="flex justify-center px-4 -mt-8 pb-16">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="w-full max-w-md">
          <motion.form variants={fadeUp} onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 space-y-5 shadow-xl border border-ink-100">

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
                <input
                  type="email" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className={`input-field pl-11 text-sm ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              <FieldError msg={errors.email} />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-pitch-700 hover:underline font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
                <input
                  type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  className={`input-field pl-11 pr-11 text-sm ${errors.password ? 'input-error' : ''}`}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors">
                  {showPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
              <FieldError msg={errors.password} />
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
