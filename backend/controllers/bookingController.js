const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const Box = require('../models/Box');

exports.createBooking = async (req, res) => {
  try {
    const { turfId, date, timeSlot, playerName, playerPhone } = req.body;

    const turf = await Turf.findById(turfId);
    if (!turf) return res.status(404).json({ message: 'Turf not found' });

    // Get all active boxes for this turf that have this time slot
    const boxes = await Box.find({ turf: turfId, isActive: true, timeSlots: timeSlot });
    if (!boxes.length)
      return res.status(400).json({ message: 'No boxes available for this slot' });

    // Find already-booked box IDs for this slot+date
    const bookedBoxIds = await Booking.find({
      turf: turfId,
      date,
      timeSlot,
      status: { $ne: 'cancelled' },
    }).distinct('box');

    // Pick the first free box
    const freeBox = boxes.find(b => !bookedBoxIds.map(String).includes(String(b._id)));
    if (!freeBox)
      return res.status(400).json({ message: 'All boxes are booked for this slot. Please choose another time.' });

    const booking = await Booking.create({
      user: req.user._id,
      turf: turfId,
      box: freeBox._id,
      date,
      timeSlot,
      totalPrice: turf.pricePerHour,
      playerName: playerName || req.user.name,
      playerPhone: playerPhone || req.user.phone,
    });

    await booking.populate([
      { path: 'turf', select: 'name location contactNumber' },
      { path: 'box', select: 'name' },
    ]);

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('turf', 'name location images pricePerHour')
      .populate('box', 'name')
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
      .populate('box', 'name')
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

// GET /api/bookings/slots?turfId=&date=
// Returns slots that are FULLY booked (all boxes taken) — used by TurfDetail slot picker
exports.getBookedSlots = async (req, res) => {
  try {
    const { turfId, date } = req.query;

    const boxes = await Box.find({ turf: turfId, isActive: true });
    if (!boxes.length) return res.json([]);

    const allSlots = [...new Set(boxes.flatMap(b => b.timeSlots))];

    const bookings = await Booking.find({
      turf: turfId,
      date,
      status: { $ne: 'cancelled' },
    }).select('timeSlot box');

    // A slot is "fully booked" only when every box that has that slot is taken
    const fullyBooked = allSlots.filter(slot => {
      const boxesWithSlot = boxes.filter(b => b.timeSlots.includes(slot));
      const bookedCount = bookings.filter(b => b.timeSlot === slot).length;
      return bookedCount >= boxesWithSlot.length;
    });

    res.json(fullyBooked);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
