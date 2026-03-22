const Box = require('../models/Box');
const Turf = require('../models/Turf');
const Booking = require('../models/Booking');

// GET /api/turfs/:turfId/boxes  — public, list all active boxes for a turf
exports.getBoxes = async (req, res) => {
  try {
    const boxes = await Box.find({ turf: req.params.turfId, isActive: true });
    res.json(boxes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/turfs/:turfId/boxes  — owner only
exports.addBox = async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.turfId);
    if (!turf) return res.status(404).json({ message: 'Turf not found' });
    if (turf.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const box = await Box.create({
      turf: turf._id,
      name: req.body.name,
      description: req.body.description,
      timeSlots: req.body.timeSlots || turf.timeSlots, // inherit turf slots by default
    });
    res.status(201).json(box);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/boxes/:id  — owner only
exports.updateBox = async (req, res) => {
  try {
    const box = await Box.findById(req.params.id).populate('turf', 'owner');
    if (!box) return res.status(404).json({ message: 'Box not found' });
    if (box.turf.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const updated = await Box.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/boxes/:id  — owner only
exports.deleteBox = async (req, res) => {
  try {
    const box = await Box.findById(req.params.id).populate('turf', 'owner');
    if (!box) return res.status(404).json({ message: 'Box not found' });
    if (box.turf.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await box.deleteOne();
    res.json({ message: 'Box deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/turfs/:turfId/availability?date=YYYY-MM-DD
// Returns per-slot availability: how many boxes are free for each slot
exports.getAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date is required' });

    const boxes = await Box.find({ turf: req.params.turfId, isActive: true });
    if (!boxes.length) return res.json({});

    // All unique slots across all boxes
    const allSlots = [...new Set(boxes.flatMap(b => b.timeSlots))];

    // All confirmed bookings for this turf+date
    const bookings = await Booking.find({
      turf: req.params.turfId,
      date,
      status: { $ne: 'cancelled' },
    }).select('box timeSlot');

    // Build availability map: slot -> { total, booked, available }
    const availability = {};
    for (const slot of allSlots) {
      const boxesWithSlot = boxes.filter(b => b.timeSlots.includes(slot));
      const bookedCount = bookings.filter(b => b.timeSlot === slot).length;
      availability[slot] = {
        total: boxesWithSlot.length,
        booked: bookedCount,
        available: Math.max(0, boxesWithSlot.length - bookedCount),
      };
    }

    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
