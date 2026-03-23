import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMapPin, FiClock, FiCalendar, FiUsers, FiTrash2, FiShare2, FiZap, FiLogIn } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const TYPE_COLORS = {
  'Box Cricket': { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  'Open Ground': { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9' },
};

const AVATAR_COLORS = [
  ['#1B5E20', '#2E7D32'], ['#1565C0', '#1976D2'],
  ['#4A148C', '#6A1B9A'], ['#BF360C', '#D84315'], ['#0D47A1', '#1565C0'],
];

function minutesUntil(date, time) {
  try { return Math.floor((new Date(`${date}T${time}`) - Date.now()) / 60000); }
  catch { return 9999; }
}

function Avatar({ name, size = 'md', isOrganiser = false }) {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  const [from, to] = AVATAR_COLORS[idx];
  const sz = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base';
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-black text-white flex-shrink-0 relative`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      {(name || '?').charAt(0).toUpperCase()}
      {isOrganiser && (
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-pitch-600 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white">★</span>
      )}
    </div>
  );
}

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => { fetchMatch(); }, [id]);

  const fetchMatch = async () => {
    try {
      const { data } = await api.get(`/matches/${id}`);
      setMatch(data);
    } catch {
      toast.error('Match not found');
      navigate('/matches');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) return navigate('/login');
    setActing(true);
    try {
      const { data } = await api.post(`/matches/${id}/join`);
      setMatch(data);
      toast.success('You joined! Share with friends 🏏');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not join');
    } finally { setActing(false); }
  };

  const handleLeave = async () => {
    setActing(true);
    try {
      await api.delete(`/matches/${id}/join`);
      toast.success('Left the match');
      fetchMatch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not leave');
    } finally { setActing(false); }
  };

  const handleCancel = async () => {
    setActing(true);
    try {
      await api.delete(`/matches/${id}`);
      toast.success('Match cancelled');
      navigate('/matches');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    } finally { setActing(false); }
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = match
      ? `🏏 ${match.title}\n📍 ${match.city}${match.location ? ` · ${match.location}` : ''}\n🕐 ${match.date} at ${match.time}\n\nJoin here: ${url}`
      : url;
    if (navigator.share) {
      navigator.share({ title: match?.title, text, url });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-ink-50">
      <div className="w-10 h-10 border-2 border-pitch-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!match) return null;

  const isCreator = String(match.createdBy?._id) === String(user?._id);
  const hasJoined = match.players.some(p => String(p.user?._id) === String(user?._id));
  const spotsLeft = match.totalPlayersNeeded - match.players.length;
  const fillPct = Math.min(100, (match.players.length / match.totalPlayersNeeded) * 100);
  const isOpen = match.status === 'open';
  const isFull = match.status === 'full';
  const isCancelled = match.status === 'cancelled';
  const mins = minutesUntil(match.date, match.time);
  const isUrgent = isOpen && mins >= 0 && mins <= 180;
  const typeStyle = TYPE_COLORS[match.matchType] || TYPE_COLORS['Box Cricket'];

  return (
    <div className="min-h-screen bg-ink-50">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-700 pt-16 relative overflow-hidden">
        {isUrgent && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />
        )}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[140px] opacity-[0.06] select-none pointer-events-none leading-none">🏏</div>

        <div className="max-w-3xl mx-auto px-4 pt-8 pb-10 relative">
          <button onClick={() => navigate('/matches')}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors text-sm font-medium">
            <FiArrowLeft /> Back to matches
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Chips row */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}` }}>
                  🏏 {match.matchType || 'Cricket'}
                </span>
                {isUrgent && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white flex items-center gap-1">
                    🔥 {mins <= 60 ? `Starts in ${mins}m` : `Starts in ${Math.floor(mins / 60)}h ${mins % 60}m`}
                  </span>
                )}
                {isFull && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">✅ Team complete</span>}
                {isCancelled && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">Cancelled</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{match.title}</h1>
              <p className="text-white/50 text-sm mt-2">
                Posted by <span className="text-white/80 font-semibold">{match.createdBy?.name}</span>
              </p>
            </div>
            <button onClick={handleShare}
              className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors flex-shrink-0 mt-1"
              title="Share on WhatsApp">
              <FiShare2 />
            </button>
          </div>

          {/* Fill bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60 flex items-center gap-1.5">
                <FiUsers className="text-xs" />
                {match.players.length} of {match.totalPlayersNeeded} players confirmed
              </span>
              <span className="text-white font-bold">{Math.round(fillPct)}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/15 overflow-hidden">
              <motion.div className="h-full rounded-full"
                initial={{ width: 0 }} animate={{ width: `${fillPct}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{ background: isFull ? '#FCD34D' : 'white' }} />
            </div>
            {isOpen && (
              <p className="text-white/50 text-xs mt-2">
                {spotsLeft} more player{spotsLeft !== 1 ? 's' : ''} needed
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* Info tiles */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-ink-100">
            {[
              { icon: FiMapPin,   label: 'Where',   value: `${match.city}${match.location ? ` · ${match.location}` : ''}` },
              { icon: FiCalendar, label: 'Date',    value: match.date },
              { icon: FiClock,    label: 'Time',    value: match.time },
              { icon: FiUsers,    label: 'Players', value: `${match.players.length} / ${match.totalPlayersNeeded}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-4 text-center">
                <Icon className="text-pitch-600 mx-auto mb-1.5 text-base" />
                <p className="text-[11px] text-ink-400 uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-sm font-bold text-ink-800 mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
          {match.description && (
            <div className="px-5 py-4 border-t border-ink-100 bg-ink-50/50">
              <p className="text-sm text-ink-600 leading-relaxed">{match.description}</p>
            </div>
          )}
        </motion.div>

        {/* WhatsApp share nudge */}
        {isOpen && (
          <button onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-[#25D366] text-white hover:bg-[#1ebe5d] transition-colors shadow-sm">
            <FiShare2 /> Share on WhatsApp — invite your friends
          </button>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          {isCancelled ? (
            <div className="w-full flex items-center justify-center py-4 rounded-2xl font-bold text-sm bg-red-50 border-2 border-red-200 text-red-500">
              ✕ This match has been cancelled
            </div>
          ) : !user ? (
            <button onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-pitch-800 to-pitch-700 text-white hover:from-pitch-900 hover:to-pitch-800 transition-all shadow-xl shadow-pitch-700/30">
              <FiLogIn /> Login to join this match
            </button>
          ) : !isCreator && !hasJoined && isOpen ? (
            <button onClick={handleJoin} disabled={acting}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-pitch-800 to-pitch-700 text-white hover:from-pitch-900 hover:to-pitch-800 transition-all shadow-xl shadow-pitch-700/30 disabled:opacity-50 active:scale-[0.98]">
              <FiZap className="text-lg" />
              {acting ? 'Joining...' : `Join this match — ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
            </button>
          ) : !isCreator && hasJoined ? (
            <div className="flex gap-3">
              <div className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm bg-pitch-50 border-2 border-pitch-200 text-pitch-700">
                ✓ You're confirmed for this match
              </div>
              <button onClick={handleLeave} disabled={acting}
                className="px-6 py-4 rounded-2xl font-bold text-sm border-2 border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 whitespace-nowrap">
                {acting ? '...' : 'Leave'}
              </button>
            </div>
          ) : isCreator ? (
            <div className="flex gap-3">
              <div className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm bg-pitch-50 border-2 border-pitch-200 text-pitch-700">
                ★ You organised this match
              </div>
              <button onClick={() => setConfirmOpen(true)} disabled={acting}
                className="flex items-center gap-2 px-5 py-4 rounded-2xl font-bold text-sm border-2 border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                <FiTrash2 className="text-sm" /> {acting ? '...' : 'Cancel'}
              </button>
            </div>
          ) : isFull ? (
            <div className="w-full flex items-center justify-center py-4 rounded-2xl font-bold text-sm bg-amber-50 border-2 border-amber-200 text-amber-700">
              🏏 Team is complete — no spots left
            </div>
          ) : null}
        </motion.div>

        {/* Who's playing */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-ink-900 flex items-center gap-2">
              <FiUsers className="text-pitch-600" /> Who's playing
            </h2>
            <span className="text-xs font-semibold text-ink-400 bg-ink-100 px-2.5 py-1 rounded-full">
              {match.players.length} / {match.totalPlayersNeeded}
            </span>
          </div>

          {match.players.length > 0 && (
            <div className="space-y-2 mb-4">
              {match.players.map((p, i) => {
                const isOrg = String(p.user?._id) === String(match.createdBy?._id);
                const isMe = String(p.user?._id) === String(user?._id);
                return (
                  <motion.div key={p._id || i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isMe ? 'bg-pitch-50 border border-pitch-200' : 'bg-ink-50 hover:bg-ink-100'}`}>
                    <Avatar name={p.user?.name} size="sm" isOrganiser={isOrg} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-800 truncate">
                        {p.user?.name || 'Player'}
                        {isMe && <span className="ml-1.5 text-xs text-pitch-600 font-normal">(you)</span>}
                      </p>
                      {isOrg && <p className="text-[11px] text-pitch-600 font-semibold">Organiser</p>}
                    </div>
                    <span className="text-xs text-ink-300 font-mono">#{i + 1}</span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {spotsLeft > 0 && !isCancelled && (
            <div>
              <p className="text-xs text-ink-400 font-semibold uppercase tracking-wider mb-2">
                {spotsLeft} open slot{spotsLeft !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: Math.min(spotsLeft, 6) }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/50">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-ink-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-ink-300 text-xs font-bold">?</span>
                    </div>
                    <span className="text-xs text-ink-400">Waiting...</span>
                  </div>
                ))}
                {spotsLeft > 6 && (
                  <div className="flex items-center justify-center p-2.5 rounded-xl border-2 border-dashed border-ink-200">
                    <span className="text-xs text-ink-400 font-semibold">+{spotsLeft - 6} more</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {match.players.length === 0 && (
            <p className="text-sm text-ink-400 italic text-center py-4">No one has joined yet. Be the first! 🏏</p>
          )}
        </motion.div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        danger
        title="Cancel this match?"
        message="Everyone who joined will be removed. This cannot be undone."
        confirmText={acting ? 'Cancelling...' : 'Yes, cancel it'}
        cancelText="Keep it"
        onConfirm={() => { setConfirmOpen(false); handleCancel(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
