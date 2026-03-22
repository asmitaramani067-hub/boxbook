const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema({
  turf: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: true },
  name: { type: String, required: true, trim: true }, // e.g. "Box 1", "Box A"
  description: { type: String },
  timeSlots: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Box', boxSchema);
