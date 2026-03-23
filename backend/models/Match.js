const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  date: { type: String, required: true },                    // "YYYY-MM-DD"
  time: { type: String, required: true },                    // "HH:MM" (24h)
  matchType: {
    type: String,
    enum: ['Box Cricket', 'Open Ground', 'Tape Ball', 'Tennis Ball', 'Hard Ball'],
    default: 'Box Cricket',
  },
  sport: { type: String, default: 'Cricket', enum: ['Cricket'] },
  totalPlayersNeeded: { type: Number, required: true, min: 1, max: 22 },
  description: { type: String, trim: true },
  status: { type: String, enum: ['open', 'full', 'cancelled'], default: 'open' },
  players: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

// Auto-update status when players fill up
matchSchema.pre('save', function () {
  if (this.players.length >= this.totalPlayersNeeded) {
    this.status = 'full';
  } else if (this.status === 'full' && this.players.length < this.totalPlayersNeeded) {
    this.status = 'open';
  }
});

module.exports = mongoose.model('Match', matchSchema);
