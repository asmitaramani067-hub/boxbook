import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiEdit2, FiCheck, FiBox } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const DEFAULT_SLOTS = [
  '06:00-07:00','07:00-08:00','08:00-09:00','09:00-10:00','10:00-11:00',
  '16:00-17:00','17:00-18:00','18:00-19:00','19:00-20:00','20:00-21:00','21:00-22:00',
];

function SlotPicker({ selected, onChange }) {
  const [custom, setCustom] = useState('');
  const toggle = (s) => onChange(selected.includes(s) ? selected.filter(x => x !== s) : [...selected, s]);
  const addCustom = () => {
    if (custom && !selected.includes(custom)) { onChange([...selected, custom]); setCustom(''); }
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {DEFAULT_SLOTS.map(s => (
          <button key={s} type="button" onClick={() => toggle(s)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              selected.includes(s) ? 'bg-pitch-700 text-white border-pitch-700' : 'bg-ink-50 text-ink-600 border-ink-200 hover:border-pitch-400'
            }`}>{s}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={custom} onChange={e => setCustom(e.target.value)}
          placeholder="Custom e.g. 22:00-23:00"
          className="input-field flex-1 py-2 text-xs" />
        <button type="button" onClick={addCustom}
          className="px-3 py-2 rounded-xl border-2 border-pitch-700 text-pitch-700 hover:bg-pitch-700 hover:text-white transition-all text-sm">
          <FiPlus />
        </button>
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(s => (
            <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-pitch-100 text-pitch-800 border border-pitch-300">
              {s}
              <button type="button" onClick={() => toggle(s)}><FiX className="text-xs" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BoxManager({ turfId, turfTimeSlots = [] }) {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', timeSlots: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBoxes(); }, [turfId]);

  const fetchBoxes = async () => {
    try {
      const { data } = await api.get(`/turfs/${turfId}/boxes`);
      setBoxes(data);
    } catch { toast.error('Failed to load boxes'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm({ name: `Box ${boxes.length + 1}`, description: '', timeSlots: turfTimeSlots });
    setEditId(null);
    setShowAdd(true);
  };

  const openEdit = (box) => {
    setForm({ name: box.name, description: box.description || '', timeSlots: box.timeSlots });
    setEditId(box._id);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Box name is required');
    setSaving(true);
    try {
      if (editId) {
        const { data } = await api.put(`/boxes/${editId}`, form);
        setBoxes(b => b.map(x => x._id === editId ? data : x));
        toast.success('Box updated');
      } else {
        const { data } = await api.post(`/turfs/${turfId}/boxes`, form);
        setBoxes(b => [...b, data]);
        toast.success('Box added');
      }
      setShowAdd(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (boxId) => {
    if (!confirm('Delete this box? All its bookings will remain but no new bookings can be made.')) return;
    try {
      await api.delete(`/boxes/${boxId}`);
      setBoxes(b => b.filter(x => x._id !== boxId));
      toast.success('Box deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="py-4 text-center text-sm text-ink-500">Loading boxes...</div>;

  return (
    <div className="mt-4 border-t border-ink-100 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiBox className="text-pitch-600 text-sm" />
          <span className="text-sm font-bold text-ink-700">Boxes ({boxes.length})</span>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-pitch-700 text-white hover:bg-pitch-800 transition-colors">
          <FiPlus className="text-xs" /> Add Box
        </button>
      </div>

      {boxes.length === 0 && !showAdd && (
        <p className="text-xs text-ink-400 italic mb-3">
          No boxes yet. Add at least one box so players can book slots.
        </p>
      )}

      {/* Box list */}
      <div className="space-y-2 mb-3">
        {boxes.map(box => (
          <div key={box._id}
            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-ink-50 border border-ink-200">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-900">{box.name}</p>
              <p className="text-xs text-ink-500 truncate">{box.timeSlots.length} slots</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => openEdit(box)}
                className="p-1.5 rounded-lg text-ink-500 hover:text-pitch-700 hover:bg-pitch-50 transition-colors">
                <FiEdit2 className="text-xs" />
              </button>
              <button onClick={() => handleDelete(box._id)}
                className="p-1.5 rounded-lg text-ink-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                <FiX className="text-xs" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="bg-pitch-50 border border-pitch-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-bold text-pitch-800">{editId ? 'Edit Box' : 'New Box'}</p>
              <div>
                <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1 block">Box Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Box 1, Box A" className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1 block">Description (optional)</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Covered box with floodlights" className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Time Slots</label>
                <SlotPicker selected={form.timeSlots} onChange={slots => setForm(f => ({ ...f, timeSlots: slots }))} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-pitch-700 text-white hover:bg-pitch-800 disabled:opacity-60 transition-colors">
                  {saving
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><FiCheck className="text-xs" /> Save</>}
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-ink-600 hover:bg-ink-100 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
