import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { fadeUp, staggerContainer } from '../animations/variants';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
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
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-3xl font-black text-white">Forgot Password?</h1>
          <p className="text-pitch-300 mt-1.5 text-sm">No worries, we'll send you a reset link</p>
        </motion.div>
      </div>

      <div className="flex justify-center px-4 -mt-10 pb-16 flex-1">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="w-full max-w-md">
          <motion.div variants={fadeUp}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-ink-100">

            {sent ? (
              /* Success state */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-pitch-100 border-2 border-pitch-300 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📧</span>
                </div>
                <h2 className="text-xl font-black text-ink-900 mb-2">Check your inbox</h2>
                <p className="text-sm text-ink-500 leading-relaxed mb-6">
                  If <span className="font-semibold text-ink-700">{email}</span> is registered with PitchUp,
                  you'll receive a password reset link shortly. The link expires in 15 minutes.
                </p>
                <p className="text-xs text-ink-400 mb-6">
                  Didn't get it? Check your spam folder or{' '}
                  <button onClick={() => setSent(false)} className="text-pitch-700 font-semibold hover:underline">
                    try again
                  </button>.
                </p>
                <Link to="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-pitch-700 hover:underline">
                  <FiArrowLeft className="text-xs" /> Back to Login
                </Link>
              </div>
            ) : (
              /* Form state */
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-sm text-ink-500 leading-relaxed">
                  Enter the email address linked to your PitchUp account and we'll send you a reset link.
                </p>

                <div>
                  <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-2 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
                    <input
                      type="email" required value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field pl-11 text-sm" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pitch-700 to-pitch-600 text-white hover:from-pitch-800 hover:to-pitch-700 transition-all duration-200 shadow-lg shadow-pitch-700/25 disabled:opacity-60">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><FiSend className="text-sm" /> Send Reset Link</>}
                </button>

                <Link to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-ink-500 hover:text-pitch-700 transition-colors font-medium">
                  <FiArrowLeft className="text-xs" /> Back to Login
                </Link>
              </form>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
