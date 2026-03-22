import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
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

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'player' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.phone && !/^[+\d\s\-()]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to PitchUp, ${user.name?.split(' ')[0]}!`);
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/turfs');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const pwStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : form.password.length < 14 ? 3 : 4;

  const pwLabel = ['', 'Too short', 'Fair', 'Good', 'Strong'][pwStrength];
  const pwColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-pitch-400', 'bg-pitch-600'][pwStrength];

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-700 pt-24 pb-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-white">Join PitchUp</h1>
          <p className="text-pitch-300 mt-2 text-sm">Create your account and start playing</p>
        </motion.div>
      </div>

      <div className="flex justify-center px-4 pb-16">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="w-full max-w-md -mt-8">
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

            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
                <input type="text" value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Your name"
                  className={`input-field pl-11 text-sm ${errors.name ? 'input-error' : ''}`} />
              </div>
              <FieldError msg={errors.name} />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
                <input type="email" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className={`input-field pl-11 text-sm ${errors.email ? 'input-error' : ''}`} />
              </div>
              <FieldError msg={errors.email} />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Phone <span className="text-ink-400 normal-case font-normal">(optional)</span></label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
                <input type="tel" value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`input-field pl-11 text-sm ${errors.phone ? 'input-error' : ''}`} />
              </div>
              <FieldError msg={errors.phone} />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min 6 characters"
                  className={`input-field pl-11 pr-11 text-sm ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors">
                  {showPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
              <FieldError msg={errors.password} />
              {/* Strength bar */}
              {form.password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i <= pwStrength ? pwColor : 'bg-ink-200'
                      }`} />
                    ))}
                  </div>
                  <span className="text-xs text-ink-400 w-14 text-right">{pwLabel}</span>
                </div>
              )}
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
