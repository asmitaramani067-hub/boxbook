import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { fadeUp, staggerContainer } from '../animations/variants';

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="field-error"><FiAlertCircle className="text-xs flex-shrink-0" /> {msg}</p>;
}

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!confirm) errs.confirm = 'Please confirm your password';
    else if (password !== confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset! Logging you in...');
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate(data.user.role === 'owner' ? '/owner/dashboard' : '/turfs');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setErrors({ password: err.response?.data?.message || 'Reset failed. Link may have expired.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-700 px-4 pt-24 pb-20 text-center flex-shrink-0">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-3xl font-black text-white">Set New Password</h1>
          <p className="text-pitch-300 mt-1.5 text-sm">Choose a strong password for your account</p>
        </motion.div>
      </div>

      <div className="flex justify-center px-4 -mt-10 pb-16 flex-1">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="w-full max-w-md">
          <motion.form variants={fadeUp} onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl border border-ink-100">

            <div>
              <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-2 block">
                New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
                <input
                  type={showPass ? 'text' : 'password'} required
                  value={password} onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: '' })); }}
                  placeholder="Min 6 characters"
                  className={`input-field pl-11 pr-11 text-sm ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors">
                  {showPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
              <FieldError msg={errors.password} />
            </div>

            <div>
              <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-2 block">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
                <input
                  type={showPass ? 'text' : 'password'} required
                  value={confirm} onChange={e => { setConfirm(e.target.value); setErrors(er => ({ ...er, confirm: '' })); }}
                  placeholder="Repeat your password"
                  className={`input-field pl-11 text-sm ${errors.confirm ? 'input-error' : ''}`} />
              </div>
              <FieldError msg={errors.confirm} />
            </div>

            {/* Strength hint */}
            {password.length > 0 && (
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    password.length >= i * 3
                      ? password.length >= 10 ? 'bg-pitch-500' : password.length >= 6 ? 'bg-amber-500' : 'bg-red-400'
                      : 'bg-ink-100'
                  }`} />
                ))}
                <span className="text-xs text-ink-400 ml-1">
                  {password.length < 6 ? 'Too short' : password.length < 10 ? 'Fair' : 'Strong'}
                </span>
              </div>
            )}

            <button type="submit" disabled={loading || password !== confirm || password.length < 6}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pitch-700 to-pitch-600 text-white hover:from-pitch-800 hover:to-pitch-700 transition-all duration-200 shadow-lg shadow-pitch-700/25 disabled:opacity-50">              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Reset Password</span><FiArrowRight className="text-sm" /></>}
            </button>

            <p className="text-center text-xs text-ink-400">
              Remember it now?{' '}
              <Link to="/login" className="text-pitch-700 font-bold hover:underline">Sign in</Link>
            </p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
