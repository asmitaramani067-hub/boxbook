import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiX, FiUpload, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { fadeUp, staggerContainer } from '../../animations/variants';
import { CITIES } from '../../constants';

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="field-error"><FiAlertCircle className="text-xs flex-shrink-0" /> {msg}</p>;
}

const DEFAULT_SLOTS = [
  '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00',
  '10:00-11:00', '16:00-17:00', '17:00-18:00', '18:00-19:00',
  '19:00-20:00', '20:00-21:00', '21:00-22:00',
];

const AMENITIES_LIST = ['Floodlights', 'Parking', 'Changing Room', 'Drinking Water', 'Washroom', 'Cafeteria', 'First Aid', 'Equipment Rental'];

const Section = ({ title, children }) => (
  <motion.div variants={fadeUp} className="card p-6 space-y-4">
    <h2 className="font-bold text-base text-ink-900 border-b border-ink-100 pb-3">{title}</h2>
    {children}
  </motion.div>
);

export default function TurfForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', description: '', location: '', city: '',
    pricePerHour: '', contactNumber: '', mapLink: '',
    timeSlots: [], amenities: [],
  });
  const [slotPricing, setSlotPricing] = useState({}); // optional per-slot prices
  const [enableSlotPricing, setEnableSlotPricing] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customSlot, setCustomSlot] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => { if (isEdit) fetchTurf(); }, [id]);

  const fetchTurf = async () => {
    try {
      const { data } = await api.get(`/turfs/${id}`);
      setForm({
        name: data.name, description: data.description || '',
        location: data.location, city: data.city,
        pricePerHour: data.pricePerHour, contactNumber: data.contactNumber,
        mapLink: data.mapLink || '', timeSlots: data.timeSlots || [],
        amenities: data.amenities || [],
      });
      const pricing = data.slotPricing ? Object.fromEntries(Object.entries(data.slotPricing)) : {};
      setSlotPricing(pricing);
      setEnableSlotPricing(Object.keys(pricing).length > 0);
      setPreviews(data.images || []);
    } catch {
      toast.error('Failed to load turf');
      navigate('/owner/dashboard');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const toggleSlot = (slot) => {
    setForm(f => ({
      ...f,
      timeSlots: f.timeSlots.includes(slot) ? f.timeSlots.filter(s => s !== slot) : [...f.timeSlots, slot],
    }));
  };

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }));
  };

  const addCustomSlot = () => {
    if (customSlot && !form.timeSlots.includes(customSlot)) {
      setForm(f => ({ ...f, timeSlots: [...f.timeSlots, customSlot] }));
      setCustomSlot('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Inline validation
    const errs = {};
    if (!form.name.trim()) errs.name = 'Turf name is required';
    if (!form.city) errs.city = 'Please select a city';
    if (!form.location.trim()) errs.location = 'Address is required';
    if (!form.pricePerHour || Number(form.pricePerHour) < 1) errs.pricePerHour = 'Enter a valid price';
    if (!form.contactNumber.trim()) errs.contactNumber = 'Contact number is required';
    else if (!/^[+\d\s\-()]{7,15}$/.test(form.contactNumber)) errs.contactNumber = 'Enter a valid contact number';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(item => fd.append(k, item));
        else fd.append(k, v);
      });
      if (enableSlotPricing && Object.keys(slotPricing).length > 0) {
        fd.append('slotPricing', JSON.stringify(slotPricing));
      } else {
        fd.append('slotPricing', JSON.stringify({}));
      }
      images.forEach(img => fd.append('images', img));

      if (isEdit) {
        await api.put(`/turfs/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Turf updated!');
      } else {
        await api.post('/turfs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Turf added!');
      }
      navigate('/owner/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save turf');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-ink-50">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-ink-500 hover:text-pitch-700 mb-6 transition-colors text-sm font-medium">
          <FiArrowLeft /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="accent-bar" />
          <h1 className="text-3xl font-black text-ink-900">{isEdit ? 'Edit Turf' : 'Add New Turf'}</h1>
          <p className="text-ink-500 mt-1 text-sm">{isEdit ? 'Update your turf details' : 'List your turf on PitchUp'}</p>
        </motion.div>

        <motion.form initial="hidden" animate="visible" variants={staggerContainer}
          onSubmit={handleSubmit} className="space-y-5">

          <Section title="Basic Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Turf Name *</label>
                <input required value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
                  placeholder="e.g. Green Arena Box Cricket"
                  className={`input-field text-sm ${errors.name ? 'input-error' : ''}`} />
                <FieldError msg={errors.name} />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">City *</label>
                <select required value={form.city} onChange={e => { setForm(f => ({ ...f, city: e.target.value })); setErrors(er => ({ ...er, city: '' })); }}
                  className={`input-field appearance-none cursor-pointer text-sm ${errors.city ? 'input-error' : ''}`}>
                  <option value="">-- Select City --</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <FieldError msg={errors.city} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Full Address *</label>
              <input required value={form.location} onChange={e => { setForm(f => ({ ...f, location: e.target.value })); setErrors(er => ({ ...er, location: '' })); }}
                placeholder="Street, Area, City"
                className={`input-field text-sm ${errors.location ? 'input-error' : ''}`} />
              <FieldError msg={errors.location} />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe your turf..." rows={3} className="input-field resize-none text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Price per Hour (&#8377;) *</label>
                <input type="number" required min="1" value={form.pricePerHour}
                  onChange={e => { setForm(f => ({ ...f, pricePerHour: e.target.value })); setErrors(er => ({ ...er, pricePerHour: '' })); }}
                  placeholder="e.g. 800"
                  className={`input-field text-sm ${errors.pricePerHour ? 'input-error' : ''}`} />
                <FieldError msg={errors.pricePerHour} />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Contact Number *</label>
                <input required value={form.contactNumber}
                  onChange={e => { setForm(f => ({ ...f, contactNumber: e.target.value })); setErrors(er => ({ ...er, contactNumber: '' })); }}
                  placeholder="+91 98751 23271"
                  className={`input-field text-sm ${errors.contactNumber ? 'input-error' : ''}`} />
                <FieldError msg={errors.contactNumber} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 block">Google Maps Link</label>
              <input value={form.mapLink} onChange={e => setForm(f => ({ ...f, mapLink: e.target.value }))}
                placeholder="https://maps.google.com/..." className="input-field text-sm" />
            </div>
          </Section>

          <Section title="Turf Images">
            <label className="flex flex-col items-center justify-center h-32 rounded-xl cursor-pointer transition-all duration-200 border-2 border-dashed border-ink-300 hover:border-pitch-600 hover:bg-pitch-50">
              <FiUpload className="text-2xl text-ink-500 mb-2" />
              <span className="text-sm text-ink-500">Click to upload images (max 5)</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {previews.map((p, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-ink-200">
                    <img src={p.startsWith('/') ? `http://localhost:5000${p}` : p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Available Time Slots">
            <div className="flex flex-wrap gap-2">
              {DEFAULT_SLOTS.map(slot => (
                <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                  style={{
                    background: form.timeSlots.includes(slot) ? '#2E7D32' : '#F9FAFB',
                    border: form.timeSlots.includes(slot) ? '1px solid #2E7D32' : '1px solid #E5E7EB',
                    color: form.timeSlots.includes(slot) ? '#fff' : '#374151',
                  }}>
                  {slot}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={customSlot} onChange={e => setCustomSlot(e.target.value)}
                placeholder="Custom slot e.g. 22:00-23:00" className="input-field flex-1 text-sm py-2" />
              <button type="button" onClick={addCustomSlot} className="btn-outline py-2 px-4 text-sm">
                <FiPlus />
              </button>
            </div>
            {form.timeSlots.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.timeSlots.map(s => (
                  <span key={s} className="badge-green flex items-center gap-1.5">
                    {s}
                    <button type="button" onClick={() => toggleSlot(s)} className="hover:text-pitch-900 transition-colors">
                      <FiX className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Section>

          {/* ── Optional Slot Pricing ── */}
          <motion.div variants={fadeUp} className="card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div>
                <h2 className="font-bold text-base text-ink-900">Slot-Based Pricing</h2>
                <p className="text-xs text-ink-400 mt-0.5">Optional — set different prices for peak/off-peak hours</p>
              </div>
              <button type="button" onClick={() => setEnableSlotPricing(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enableSlotPricing ? 'bg-pitch-700' : 'bg-ink-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enableSlotPricing ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {enableSlotPricing && (
              <div className="space-y-3">
                {form.timeSlots.length === 0 ? (
                  <p className="text-xs text-ink-400 italic">Select time slots above first to set per-slot prices.</p>
                ) : (
                  <>
                    <p className="text-xs text-ink-500">
                      Leave a slot blank to use the base price (&#8377;{form.pricePerHour || '—'}/hr).
                      The card will show "Starting from &#8377;X" based on the lowest price.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {form.timeSlots.map(slot => {
                        const hour = parseInt(slot.split(':')[0], 10);
                        const label = hour < 12 ? '🌅 Morning' : hour < 17 ? '☀️ Afternoon' : '🌙 Evening';
                        return (
                          <div key={slot} className="flex items-center gap-2 p-2.5 rounded-xl bg-ink-50 border border-ink-200">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-ink-700">{slot}</div>
                              <div className="text-xs text-ink-400">{label}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-ink-500">&#8377;</span>
                              <input
                                type="number" min="1"
                                value={slotPricing[slot] || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setSlotPricing(prev => {
                                    const next = { ...prev };
                                    if (val) next[slot] = Number(val);
                                    else delete next[slot];
                                    return next;
                                  });
                                }}
                                placeholder={form.pricePerHour || 'base'}
                                className="w-20 px-2 py-1 text-xs rounded-lg border border-ink-300 focus:border-pitch-600 focus:outline-none bg-white"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>

          <Section title="Amenities">            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map(a => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                  style={{
                    background: form.amenities.includes(a) ? '#2E7D32' : '#F9FAFB',
                    border: form.amenities.includes(a) ? '1px solid #2E7D32' : '1px solid #E5E7EB',
                    color: form.amenities.includes(a) ? '#fff' : '#374151',
                  }}>
                  {a}
                </button>
              ))}
            </div>
          </Section>

          <motion.button variants={fadeUp} type="submit" disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60">
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : isEdit ? 'Update Turf' : 'Add Turf'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
