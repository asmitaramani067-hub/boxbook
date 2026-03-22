import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
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
      toast.success(`Welcome to PitchUp, ${user.name?.split(' ')[0]}!`);
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/turfs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Green header */}
      <div className="bg-pitch-700 pt-24 pb-16 px-4 text-center">
        <h1 className="text-3xl font-black text-white">Join PitchUp</h1>
        <p className="text-pitch-200 mt-2 text-sm">Create your account and start playing</p>
      </div>

      {/* Form card */}
      <div className="flex justify-center px-4 pb-16">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}
          className="w-full max-w-md -mt-8">

          <motion.form variants={fadeUp} onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 space-y-5 shadow-xl border border-ink-100">

            {/* Role selector */}
            <div>
              <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3 block">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'player', label: 'Player', sub: 'Find & book turfs', icon: FiUser },
                  { value: 'owner', label: 'Turf Owner', sub: 'List & manage turfs', icon: FiCheckCircle },
                ].map(r => (
                  <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className={`p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                      form.role === r.value
                        ? 'border-pitch-600 bg-pitch-50'
                        : 'border-ink-200 hover:border-pitch-300 bg-white'
                    }`}>
                    <r.icon className={`text-xl mb-2 ${form.role === r.value ? 'text-pitch-700' : 'text-ink-400'}`} />
                    <p className={`font-bold text-sm ${form.role === r.value ? 'text-pitch-800' : 'text-ink-700'}`}>{r.label}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{r.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            {[
              { label: 'Full Name', key: 'name', icon: FiUser, type: 'text', placeholder: 'Your name', required: true },
              { label: 'Email', key: 'email', icon: FiMail, type: 'email', placeholder: 'you@example.com', required: true },
              { label: 'Phone', key: 'phone', icon: FiPhone, type: 'tel', placeholder: '+91 98765 43210', required: false },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
                  <input type={f.type} required={f.required} value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} className="input-field pl-11 text-sm" />
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min 6 characters" className="input-field pl-11 pr-11 text-sm" />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors">
                  {showPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Create Account</span><FiArrowRight /></>}
            </button>

            <p className="text-center text-sm text-ink-500">
              Already have an account?{' '}
              <Link to="/login" className="text-pitch-700 hover:underline font-semibold">Sign in</Link>
            </p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
