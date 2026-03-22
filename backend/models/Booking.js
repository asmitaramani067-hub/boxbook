const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  turf: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: true },
  box: { type: mongoose.Schema.Types.ObjectId, ref: 'Box', required: true },
  date: { type: String, required: true },   // "YYYY-MM-DD"
  timeSlot: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
  playerName: String,
  playerPhone: String,
}, { timestamps: true });

// Prevent double-booking: same box + date + slot cannot be confirmed twice
bookingSchema.index({ box: 1, date: 1, timeSlot: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
