const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  turf:     { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: true },
  date:     { type: String, required: true },   // "YYYY-MM-DD"
  timeSlot: { type: String, required: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notified: { type: Boolean, default: false },  // true once we've pinged them
}, { timestamps: true });

// One entry per user per slot per date
waitlistSchema.index({ turf: 1, date: 1, timeSlot: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
