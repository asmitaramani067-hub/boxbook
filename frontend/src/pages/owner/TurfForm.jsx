import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiX, FiUpload, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { fadeUp, staggerContainer } from '../../animations/variants';
import { CITIES } from '../../constants';

const DEFAULT_SLOTS = [
  '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00',
  '10:00-11:00', '16:00-17:00', '17:00-18:00', '18:00-19:00',
  '19:00-20:00', '20:00-21:00', '21:00-22:00',
];

const AMENITIES_LIST = ['Floodlights', 'Parking', 'Changing Room', 'Drinking Water', 'Washroom', 'Cafeteria', 'First Aid', 'Equipment Rental'];

export default function TurfForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', description: '', location: '', city: '',
    pricePerHour: '', contactNumber: '', mapLink: '',
    timeSlots: [], amenities: [],
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customSlot, setCustomSlot] = useState('');

  useEffect(() => {
    if (isEdit) fetchTurf();
  }, [id]);

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
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(item => fd.append(k, item));
        else fd.append(k, v);
      });
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
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <FiArrowLeft /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black">{isEdit ? 'Edit Turf' : 'Add New Turf'}</h1>
          <p className="text-gray-400 mt-1">{isEdit ? 'Update your turf details' : 'List your turf on BoxBook'}</p>
        </motion.div>

        <motion.form initial="hidden" animate="visible" variants={staggerContainer}
          onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <motion.div variants={fadeUp} className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Turf Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Green Arena Box Cricket" className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">City *</label>
                <select required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="input-field appearance-none cursor-pointer">
                  <option value="" className="bg-dark-700">-- Select City --</option>
                  {CITIES.map(c => <option key={c} value={c} className="bg-dark-700">{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Full Address *</label>
              <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Street, Area, City" className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe your turf..." rows={3} className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Price per Hour (₹) *</label>
                <input type="number" required min="1" value={form.pricePerHour}
                  onChange={e => setForm(f => ({ ...f, pricePerHour: e.target.value }))}
                  placeholder="e.g. 800" className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Contact Number *</label>
                <input required value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))}
                  placeholder="+91 98765 43210" className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Google Maps Link</label>
              <input value={form.mapLink} onChange={e => setForm(f => ({ ...f, mapLink: e.target.value }))}
                placeholder="https://maps.google.com/..." className="input-field" />
            </div>
          </motion.div>

          {/* Images */}
          <motion.div variants={fadeUp} className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg">Turf Images</h2>
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-neon/50 transition-colors">
              <FiUpload className="text-2xl text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">Click to upload images (max 5)</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {previews.map((p, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                    <img src={p.startsWith('/') ? `http://localhost:5000${p}` : p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Time Slots */}
          <motion.div variants={fadeUp} className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg">Available Time Slots</h2>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_SLOTS.map(slot => (
                <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    form.timeSlots.includes(slot) ? 'bg-neon text-black' : 'glass hover:border-neon/50'
                  }`}>
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
                  <span key={s} className="flex items-center gap-1 bg-neon/10 text-neon text-xs px-3 py-1 rounded-full border border-neon/20">
                    {s}
                    <button type="button" onClick={() => toggleSlot(s)}><FiX className="text-xs" /></button>
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Amenities */}
          <motion.div variants={fadeUp} className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map(a => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    form.amenities.includes(a) ? 'bg-neon text-black' : 'glass hover:border-neon/50'
                  }`}>
                  {a}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.button variants={fadeUp} type="submit" disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-60">
            {loading ? <span className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" /> :
              isEdit ? 'Update Turf' : 'Add Turf'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
