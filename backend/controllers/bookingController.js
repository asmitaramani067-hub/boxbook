const Booking = require('../models/Booking');
const Turf = require('../models/Turf');

exports.createBooking = async (req, res) => {
  try {
    const { turfId, date, timeSlot, playerName, playerPhone } = req.body;
    const turf = await Turf.findById(turfId);
    if (!turf) return res.status(404).json({ message: 'Turf not found' });

    // Check slot availability
    const existing = await Booking.findOne({ turf: turfId, date, timeSlot, status: { $ne: 'cancelled' } });
    if (existing) return res.status(400).json({ message: 'Slot already booked' });

    const booking = await Booking.create({
      user: req.user._id,
      turf: turfId,
      date,
      timeSlot,
      totalPrice: turf.pricePerHour,
      playerName: playerName || req.user.name,
      playerPhone: playerPhone || req.user.phone,
    });
    await booking.populate('turf', 'name location contactNumber');
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('turf', 'name location images pricePerHour')
      .sort('-createdAt');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const turfs = await Turf.find({ owner: req.user._id }).select('_id');
    const turfIds = turfs.map(t => t._id);
    const bookings = await Booking.find({ turf: { $in: turfIds } })
      .populate('turf', 'name location')
      .populate('user', 'name email phone')
      .sort('-createdAt');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBookedSlots = async (req, res) => {
  try {
    const { turfId, date } = req.query;
    const bookings = await Booking.find({ turf: turfId, date, status: { $ne: 'cancelled' } }).select('timeSlot');
    res.json(bookings.map(b => b.timeSlot));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
