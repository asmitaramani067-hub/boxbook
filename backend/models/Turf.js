const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
}, { timestamps: true });

const turfSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  location: { type: String, required: true },
  city: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  images: [{ type: String }],
  contactNumber: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timeSlots: [{ type: String }],
  amenities: [{ type: String }],
  mapLink: { type: String },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Turf', turfSchema);
