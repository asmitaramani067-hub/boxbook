const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const Box = require('../models/Box');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const Notification = require('../models/Notification');
const webpush = require('web-push');
const { acquireLock, releaseLock, isLockedByOther, getLocksForTurfDate, LOCK_TTL_MS } = require('../utils/slotLock');

webpush.setVapidDetails(
  'mailto:' + (process.env.SMTP_USER || 'admin@pitchup.com'),
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

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

    // Check slot lock — reject if another user has it locked
    if (isLockedByOther(turfId, date, timeSlot, req.user._id)) {
      return res.status(409).json({ message: 'This slot is temporarily held by another user. Please wait a moment and try again.' });
    }

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

    // Release the slot lock now that booking is confirmed
    releaseLock(turfId, date, timeSlot, req.user._id);

    await booking.populate([
      { path: 'turf', select: 'name location contactNumber owner' },
      { path: 'box', select: 'name' },
    ]);

    // Save in-app notification for owner
    await Notification.create({
      owner: turf.owner,
      message: `New booking at ${turf.name} — ${booking.playerName} on ${booking.date} (${booking.timeSlot})`,
      bookingId: booking._id,
    });

    // Send browser push notification to owner if subscribed
    try {
      const owner = await User.findById(turf.owner).select('pushSubscription');
      if (owner?.pushSubscription) {
        await webpush.sendNotification(
          owner.pushSubscription,
          JSON.stringify({
            title: `New Booking at ${turf.name}`,
            body: `${booking.playerName} booked on ${booking.date} (${booking.timeSlot})`,
          })
        );
      }
    } catch (pushErr) {
      console.error('Push notification failed:', pushErr.message);
    }

    // Notify the turf owner via email
    try {
      const owner = await User.findById(turf.owner).select('email name');
      if (owner?.email) {
        await sendEmail(
          owner.email,
          `New Booking at ${turf.name}`,
          `
            <h2>New Booking Received</h2>
            <p>Hi ${owner.name}, you have a new booking at <strong>${turf.name}</strong>.</p>
            <table style="border-collapse:collapse;width:100%">
              <tr><td style="padding:6px;border:1px solid #ddd"><strong>Player</strong></td><td style="padding:6px;border:1px solid #ddd">${booking.playerName}</td></tr>
              <tr><td style="padding:6px;border:1px solid #ddd"><strong>Phone</strong></td><td style="padding:6px;border:1px solid #ddd">${booking.playerPhone || 'N/A'}</td></tr>
              <tr><td style="padding:6px;border:1px solid #ddd"><strong>Date</strong></td><td style="padding:6px;border:1px solid #ddd">${booking.date}</td></tr>
              <tr><td style="padding:6px;border:1px solid #ddd"><strong>Time Slot</strong></td><td style="padding:6px;border:1px solid #ddd">${booking.timeSlot}</td></tr>
              <tr><td style="padding:6px;border:1px solid #ddd"><strong>Box</strong></td><td style="padding:6px;border:1px solid #ddd">${freeBox.name}</td></tr>
              <tr><td style="padding:6px;border:1px solid #ddd"><strong>Amount</strong></td><td style="padding:6px;border:1px solid #ddd">₹${booking.totalPrice}</td></tr>
            </table>
          `
        );
      }
    } catch (emailErr) {
      // Don't fail the booking if email fails
      console.error('Owner notification email failed:', emailErr.message);
    }

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

// POST /api/bookings/lock  { turfId, date, timeSlot }
// Acquires a 2-minute hold on a slot for the logged-in user.
exports.lockSlot = async (req, res) => {
  try {
    const { turfId, date, timeSlot } = req.body;
    if (!turfId || !date || !timeSlot)
      return res.status(400).json({ message: 'turfId, date and timeSlot are required' });

    const result = acquireLock(turfId, date, timeSlot, req.user._id);
    if (!result.ok) {
      return res.status(409).json({
        message: 'Slot is temporarily held by another user',
        expiresAt: result.expiresAt,
      });
    }
    res.json({ locked: true, expiresAt: result.expiresAt, ttlMs: LOCK_TTL_MS });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/bookings/lock  { turfId, date, timeSlot }
// Releases a hold the logged-in user previously acquired.
exports.unlockSlot = async (req, res) => {
  try {
    const { turfId, date, timeSlot } = req.body;
    releaseLock(turfId, date, timeSlot, req.user._id);
    res.json({ unlocked: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/locks?turfId=&date=
// Returns active locks for a turf+date so the UI can show countdown timers.
// Only expiry timestamps are exposed — no user IDs.
exports.getSlotLocks = async (req, res) => {
  try {
    const { turfId, date } = req.query;
    if (!turfId || !date) return res.status(400).json({ message: 'turfId and date are required' });
    const lockMap = getLocksForTurfDate(turfId, date);
    res.json(lockMap); // { "10:00-11:00": 1712345678000, ... }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
