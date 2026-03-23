import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiClock, FiPlus, FiSearch, FiX, FiZap, FiShare2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Constants ─────────────────────────────────────────────────────────────
const MATCH_TYPES = ['Box Cricket', 'Open Ground', 'Tape Ball', 'Tennis Ball', 'Hard Ball'];
const TYPE_COLORS = {
  'Box Cricket':   { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  'Open Ground':   { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9' },
  'Tape Ball':     { bg: '#FFF3E0', text: '#E65100', border: '#FFCC80' },
  'Tennis Ball':   { bg: '#F3E5F5', text: '#6A1B9A', border: '#CE93D8' },
  'Hard Ball':     { bg: '#FCE4EC', text: '#880E4F', border: '#F48FB1' },
};

// How urgent is this match? Returns minutes until match starts (negative = past)
function minutesUntil(date, time) {
  try {
    const dt = new Date(`${date}T${time}`);
    return Math.floor((dt - Date.now()) / 60000);
  } catch { return 9999; }
}

function urgencyInfo(mins) {
  if (mins < 0)   return null; // past
  if (mins <= 60) return { label: `Starts in ${mins}m`, cls: 'bg-red-500 text-white', fire: true };
  if (mins <= 180) return { label: `Starts in ${Math.floor(mins / 60)}h ${mins % 60}m`, cls: 'bg-amber-500 text-white', fire: false };
  return null;
}

// ── Player Avatars ────────────────────────────────────────────────────────
function PlayerAvatars({ players, total, max = 5 }) {
  const shown = players.slice(0, max);
  const empty = Math.max(0, total - players.length);
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((p, i) => (
        <div key={i} title={p.user?.name}
          className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-pitch-500 to-pitch-800 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white text-[11px] font-black">
            {(p.user?.name || '?').charAt(0).toUpperCase()}
          </span>
        </div>
      ))}
      {Array.from({ length: Math.min(empty, max - shown.length) }).map((_, i) => (
        <div key={`e${i}`}
          className="w-8 h-8 rounded-full border-2 border-dashed border-ink-300 bg-ink-50 flex items-center justify-center flex-shrink-0">
          <span className="text-ink-300 text-[10px] font-bold">?</span>
        </div>
      ))}
      {empty > (max - shown.length) && (
        <div className="w-8 h-8 rounded-full border-2 border-white bg-ink-200 flex items-center justify-center flex-shrink-0">
          <span className="text-ink-600 text-[10px] font-bold">+{empty - (max - shown.length)}</span>
        </div>
      )}
    </div>
  );
}

// ── Match Card ────────────────────────────────────────────────────────────
function MatchCard({ match, onJoin, onShare, currentUserId, joiningId }) {
  const navigate = useNavigate();
  const spotsLeft = match.totalPlayersNeeded - match.players.length;
  const hasJoined = match.players.some(p => (p.user?._id || p.user) === currentUserId);
  const isCreator = (match.createdBy?._id || match.createdBy) === currentUserId;
  const isOpen = match.status === 'open';
  const isFull = match.status === 'full';
  const fillPct = Math.min(100, (match.players.length / match.totalPlayersNeeded) * 100);
  const mins = minutesUntil(match.date, match.time);
  const urgency = isOpen ? urgencyInfo(mins) : null;
  const typeStyle = TYPE_COLORS[match.matchType] || TYPE_COLORS['Box Cricket'];
  const isJoining = joiningId === match._id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden flex flex-col group"
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/matches/${match._id}`)}>

      {/* Top accent line — urgency colour */}
      <div className={`h-1 w-full ${urgency?.fire ? 'bg-red-500' : urgency ? 'bg-amber-400' : isFull ? 'bg-amber-300' : 'bg-pitch-500'}`} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Row 1: type chip + urgency + share */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}` }}>
              🏏 {match.matchType}
            </span>
            {urgency && (
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${urgency.cls}`}>
                {urgency.fire && '🔥'} {urgency.label}
              </span>
            )}
            {isFull && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                ✅ Team complete
              </span>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onShare(match); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-300 hover:text-pitch-600 hover:bg-pitch-50 transition-colors flex-shrink-0">
            <FiShare2 className="text-sm" />
          </button>
        </div>

        {/* Row 2: Title */}
        <h3 className="font-black text-ink-900 text-sm leading-snug line-clamp-2 group-hover:text-pitch-700 transition-colors">
          {match.title}
        </h3>

        {/* Row 3: Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-500">
          <span className="flex items-center gap-1">
            <FiMapPin className="text-pitch-600 flex-shrink-0" />
            <span className="truncate max-w-[120px]">{match.city}{match.location ? ` · ${match.location}` : ''}</span>
          </span>
          <span className="flex items-center gap-1">
            <FiClock className="text-pitch-600 flex-shrink-0" />
            {match.date} · {match.time}
          </span>
        </div>

        {/* Row 4: Player fill bar */}
        <div>
          <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden mb-1.5">
            <motion.div className="h-full rounded-full"
              initial={{ width: 0 }} animate={{ width: `${fillPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ background: isFull ? '#F59E0B' : '#2E7D32' }} />
          </div>
          <div className="flex items-center justify-between">
            <PlayerAvatars players={match.players} total={match.totalPlayersNeeded} max={4} />
            <span className="text-xs text-ink-400 font-medium">
              {isOpen
                ? <span className="text-pitch-700 font-bold">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</span>
                : <span className="text-amber-600 font-bold">Team full</span>}
            </span>
          </div>
        </div>

        {/* Row 5: CTA */}
        {isOpen && !hasJoined && !isCreator && currentUserId && (
          <button
            onClick={e => { e.stopPropagation(); onJoin(match._id); }}
            disabled={isJoining}
            className="w-full py-2.5 rounded-xl font-black text-sm bg-pitch-700 text-white hover:bg-pitch-800 active:scale-[0.97] transition-all shadow-sm shadow-pitch-700/20 disabled:opacity-60 flex items-center justify-center gap-1.5 mt-auto">
            {isJoining
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><FiZap className="text-xs" /> Join this match</>}
          </button>
        )}
        {hasJoined && (
          <div className="w-full py-2.5 rounded-xl font-bold text-sm bg-pitch-50 border border-pitch-200 text-pitch-700 text-center mt-auto">
            ✓ You're in
          </div>
        )}
        {isCreator && (
          <div className="w-full py-2.5 rounded-xl font-bold text-sm bg-ink-50 border border-ink-200 text-ink-500 text-center mt-auto">
            Your match
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Quick Post Modal (3-step) ─────────────────────────────────────────────
function QuickPostModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=type+players, 2=where+when, 3=done
  const [form, setForm] = useState({
    matchType: 'Box Cricket', totalPlayersNeeded: 5,
    city: '', location: '', date: '', time: '', description: '',
  });
  const [posting, setPosting] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  // Auto-generate title
  const autoTitle = `Need ${form.totalPlayersNeeded} more player${form.totalPlayersNeeded !== 1 ? 's' : ''} — ${form.matchType}${form.location ? ` at ${form.location}` : ''}`;

  const handleSubmit = async () => {
    if (!user) return navigate('/login');
    setPosting(true);
    try {
      const { data } = await api.post('/matches', {
        ...form,
        title: autoTitle,
        sport: 'Cricket',
        totalPlayersNeeded: Number(form.totalPlayersNeeded) + 1, // +1 for the creator
      });
      toast.success('Match posted! Share it with your friends 🏏');
      onSuccess(data._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-pitch-900 to-pitch-700 px-6 pt-6 pb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏏</span>
              <div>
                <h2 className="text-white font-black text-lg leading-tight">Post a Match</h2>
                <p className="text-pitch-300 text-xs">Step {step} of 2</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <FiX />
            </button>
          </div>
          {/* Step dots */}
          <div className="flex gap-2">
            {[1, 2].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-white' : 'bg-white/25'}`} />
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-5">
              {/* Match type */}
              <div>
                <p className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-3">What type of match?</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {MATCH_TYPES.map(t => {
                    const s = TYPE_COLORS[t];
                    const sel = form.matchType === t;
                    return (
                      <button key={t} type="button"
                        onClick={() => setForm(p => ({ ...p, matchType: t }))}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all text-left"
                        style={sel
                          ? { background: s.bg, borderColor: s.text, color: s.text }
                          : { background: '#F9FAFB', borderColor: '#E5E7EB', color: '#6B7280' }}>
                        🏏 {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Players needed */}
              <div>
                <p className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-3">How many players do you need?</p>
                <div className="flex items-center gap-4 bg-ink-50 rounded-2xl p-4">
                  <button type="button"
                    onClick={() => setForm(p => ({ ...p, totalPlayersNeeded: Math.max(1, p.totalPlayersNeeded - 1) }))}
                    className="w-12 h-12 rounded-xl border-2 border-ink-200 bg-white font-black text-xl text-ink-700 hover:border-pitch-500 hover:text-pitch-700 transition-all flex items-center justify-center">
                    −
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-5xl font-black text-pitch-700 leading-none">{form.totalPlayersNeeded}</div>
                    <div className="text-xs text-ink-400 mt-1">players needed</div>
                    <div className="text-[11px] text-pitch-600 mt-0.5">You're already in</div>
                  </div>
                  <button type="button"
                    onClick={() => setForm(p => ({ ...p, totalPlayersNeeded: Math.min(22, p.totalPlayersNeeded + 1) }))}
                    className="w-12 h-12 rounded-xl border-2 border-ink-200 bg-white font-black text-xl text-ink-700 hover:border-pitch-500 hover:text-pitch-700 transition-all flex items-center justify-center">
                    +
                  </button>
                </div>
              </div>

              <button onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl font-black text-sm bg-pitch-700 text-white hover:bg-pitch-800 transition-all shadow-lg shadow-pitch-700/25">
                Next — Where & When →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-2 block">City *</label>
                  <input required value={form.city} onChange={f('city')}
                    placeholder="Ahmedabad" className="input-field text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-2 block">Ground / Area</label>
                  <input value={form.location} onChange={f('location')}
                    placeholder="Satellite Ground" className="input-field text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-2 block">Date *</label>
                  <input required type="date" min={today} value={form.date} onChange={f('date')}
                    className="input-field text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-2 block">Time *</label>
                  <input required type="time" value={form.time} onChange={f('time')}
                    className="input-field text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-2 block">Extra info (optional)</label>
                <textarea value={form.description} onChange={f('description')} rows={2}
                  placeholder="Skill level, bring your own bat, etc."
                  className="input-field text-sm resize-none" />
              </div>

              {/* Preview */}
              {form.city && form.date && form.time && (
                <div className="bg-pitch-50 border border-pitch-200 rounded-xl p-3">
                  <p className="text-xs text-pitch-600 font-semibold mb-1">Your match will appear as:</p>
                  <p className="text-sm font-black text-ink-900">"{autoTitle}"</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl font-semibold text-sm border border-ink-200 text-ink-600 hover:bg-ink-50 transition-colors">
                  ← Back
                </button>
                <button onClick={handleSubmit} disabled={posting || !form.city || !form.date || !form.time}
                  className="flex-1 py-3.5 rounded-xl font-black text-sm bg-pitch-700 text-white hover:bg-pitch-800 transition-all shadow-lg shadow-pitch-700/25 disabled:opacity-50">
                  {posting ? 'Posting...' : '🏏 Post Match'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function FindPlayers() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [tab, setTab] = useState('looking'); // looking | complete | all
  const [showModal, setShowModal] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  useEffect(() => { fetchMatches(); }, [cityFilter, tab]);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab === 'looking') params.status = 'open';
      if (tab === 'complete') params.status = 'full';
      if (cityFilter) params.city = cityFilter;
      const { data } = await api.get('/matches', { params });
      // Sort: urgent (soonest) first
      const sorted = [...data.matches].sort((a, b) => {
        const ma = minutesUntil(a.date, a.time);
        const mb = minutesUntil(b.date, b.time);
        if (ma < 0 && mb >= 0) return 1;
        if (mb < 0 && ma >= 0) return -1;
        return ma - mb;
      });
      setMatches(sorted);
    } catch {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [cityFilter, tab]);

  const handleJoin = async (matchId) => {
    if (!user) return navigate('/login');
    setJoiningId(matchId);
    try {
      await api.post(`/matches/${matchId}/join`);
      toast.success('You joined! 🏏 Share with your friends');
      fetchMatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not join');
    } finally {
      setJoiningId(null);
    }
  };

  const handleShare = (match) => {
    const url = `${window.location.origin}/matches/${match._id}`;
    const text = `🏏 ${match.title}\n📍 ${match.city}${match.location ? ` · ${match.location}` : ''}\n🕐 ${match.date} at ${match.time}\n\nJoin here: ${url}`;
    if (navigator.share) {
      navigator.share({ title: match.title, text, url });
    } else {
      // WhatsApp fallback
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const openMatches = matches.filter(m => m.status === 'open');
  const urgentCount = openMatches.filter(m => minutesUntil(m.date, m.time) <= 180 && minutesUntil(m.date, m.time) >= 0).length;
  const spotsTotal = openMatches.reduce((s, m) => s + (m.totalPlayersNeeded - m.players.length), 0);

  const TABS = [
    { value: 'looking',  label: 'Looking for players' },
    { value: 'complete', label: 'Team complete' },
    { value: 'all',      label: 'All' },
  ];

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <QuickPostModal
            onClose={() => setShowModal(false)}
            onSuccess={id => { setShowModal(false); navigate(`/matches/${id}`); }}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-ink-50">

        {/* ── Hero ── */}
        <div className="bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-700 pt-24 pb-12 px-4 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-[220px] opacity-[0.05] select-none pointer-events-none leading-none">🏏</div>
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-[0.08] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #A5D6A7, transparent)', transform: 'translate(-40%, 40%)' }} />

          <div className="max-w-5xl mx-auto relative">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-pitch-400 text-xs font-bold uppercase tracking-widest mb-2">🏏 Cricket · Find Players</p>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.1]">
                  Need players<br />
                  <span className="text-pitch-300">for today?</span>
                </h1>
                <p className="text-pitch-200 mt-3 text-sm max-w-xs leading-relaxed">
                  Post in 30 seconds. Players nearby join instantly. No calls, no WhatsApp groups.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                onClick={() => { if (!user) return navigate('/login'); setShowModal(true); }}
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-base bg-white text-pitch-800 hover:bg-pitch-50 transition-all shadow-2xl shadow-black/30 whitespace-nowrap flex-shrink-0">
                <FiPlus className="text-lg" /> Post a Match
              </motion.button>
            </motion.div>

            {/* Live stats */}
            {!loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="flex items-center gap-6 mt-8 flex-wrap">
                <div>
                  <div className="text-3xl font-black text-white">{openMatches.length}</div>
                  <div className="text-pitch-300 text-xs font-medium">matches need players</div>
                </div>
                {urgentCount > 0 && (
                  <>
                    <div className="w-px h-8 bg-white/20" />
                    <div>
                      <div className="text-3xl font-black text-red-400">{urgentCount} 🔥</div>
                      <div className="text-pitch-300 text-xs font-medium">starting within 3 hours</div>
                    </div>
                  </>
                )}
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <div className="text-3xl font-black text-white">{spotsTotal}</div>
                  <div className="text-pitch-300 text-xs font-medium">total spots open</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Sticky filters ── */}
        <div className="sticky top-16 z-30 bg-white border-b border-ink-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3 flex gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 text-sm pointer-events-none" />
              <input value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                placeholder="Search by city..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-ink-200 text-sm bg-ink-50 focus:bg-white focus:border-pitch-500 outline-none transition-all" />
              {cityFilter && (
                <button onClick={() => setCityFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
                  <FiX className="text-sm" />
                </button>
              )}
            </div>
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-ink-100 rounded-xl p-1 flex-shrink-0">
              {TABS.map(t => (
                <button key={t.value} onClick={() => setTab(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    tab === t.value ? 'bg-white text-pitch-700 shadow-sm' : 'text-ink-500 hover:text-ink-800'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-ink-100 overflow-hidden animate-pulse">
                  <div className="h-1 bg-ink-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-ink-100 rounded-full w-1/3" />
                    <div className="h-4 bg-ink-100 rounded-full w-4/5" />
                    <div className="h-3 bg-ink-100 rounded-full w-2/3" />
                    <div className="h-2 bg-ink-100 rounded-full w-full" />
                    <div className="h-9 bg-ink-100 rounded-xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : matches.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <div className="text-6xl mb-4">🏏</div>
              <h3 className="text-xl font-black text-ink-700">
                {tab === 'looking' ? 'No matches looking for players right now' : 'No matches found'}
              </h3>
              <p className="text-ink-400 text-sm mt-2 mb-6">
                {cityFilter ? `Nothing in "${cityFilter}" yet.` : 'Be the first to post one!'}
              </p>
              <button onClick={() => { if (!user) return navigate('/login'); setShowModal(true); }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-pitch-700 text-white hover:bg-pitch-800 transition-colors shadow-lg shadow-pitch-700/25">
                <FiPlus /> Post a Match
              </button>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {matches.map(m => (
                  <MatchCard key={m._id} match={m}
                    onJoin={handleJoin} onShare={handleShare}
                    currentUserId={user?._id} joiningId={joiningId} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
