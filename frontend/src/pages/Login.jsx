import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
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
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.05),transparent_70%)]" />
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}
        className="w-full max-w-md relative z-10">
        <motion.div variants={fadeUp} className="text-center mb-8">
          <GiCricketBat className="text-neon text-4xl mx-auto mb-3" />
          <h1 className="text-3xl font-black">Welcome Back</h1>
          <p className="text-gray-400 mt-1">Sign in to your BoxBook account</p>
        </motion.div>

        <motion.form variants={fadeUp} onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com" className="input-field pl-11" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPass ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" className="input-field pl-11 pr-11" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <motion.button type="submit" disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? (
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : 'Sign In'}
          </motion.button>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-neon hover:underline font-medium">Sign up</Link>
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
}
