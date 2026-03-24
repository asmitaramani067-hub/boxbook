const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const Box = require('../models/Box');
const User = require('../models/User');
const Waitlist = require('../models/Waitlist');
const sendEmail = require('../utils/sendEmail');
const Notification = require('../models/Notification');
const webpush = require('web-push');
const { acquireLock, releaseLock, isLockedByOther, getLocksForTurfDate, LOCK_TTL_MS } = require('../utils/slotLock');

webpush.setVapidDetails(
  'mailto:' + (process.env.SMTP_USER || 'admin@pitchup.com'),
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Notify first un-notified waitlist entry when a slot opens up
async function notifyWaitlist(turfId, date, timeSlot) {
  try {
    const entry = await Waitlist.findOne({ turf: turfId, date, timeSlot, notified: false })
      .sort('createdAt')
      .populate('user', 'name email pushSubscription');
    if (!entry) return;
    entry.notified = true;
    await entry.save();
    const turf = await Turf.findById(turfId).select('name');
    const msg = `A slot just opened up! ${turf?.name} — ${timeSlot} on ${date} is now available. Book quickly before it fills up.`;
    await Notification.create({ owner: entry.user._id, message: msg });
    if (entry.user.email) {
      sendEmail(entry.user.email, `Slot Available — ${turf?.name}`,
        `<h2>Good news! A slot opened up 🏏</h2><p>${msg}</p><p><a href="${process.env.FRONTEND_URL}/turfs/${turfId}">Book now</a></p>`
      ).catch(() => {});
    }
    if (entry.user.pushSubscription) {
      webpush.sendNotification(entry.user.pushSubscription, JSON.stringify({ title: 'Slot Available!', body: msg })).catch(() => {});
    }
  } catch (e) {
    console.error('Waitlist notify error:', e.message);
  }
}

exports.createBooking = async (req, res) => {
  try {
    const { turfId, date, timeSlot, playerName, playerPhone } = req.body;

    const turf = await Turf.findById(turfId);
    if (!turf) return res.status(404).json({ message: 'Turf not found' });

    const boxes = await Box.find({ turf: turfId, isActive: true, timeSlots: timeSlot });
    if (!boxes.length)
      return res.status(400).json({ message: 'No boxes available for this slot' });

    const bookedBoxIds = await Booking.find({
      turf: turfId, date, timeSlot, status: { $ne: 'cancelled' },
    }).distinct('box');

    const freeBox = boxes.find(b => !bookedBoxIds.map(String).includes(String(b._id)));
    if (!freeBox)
      return res.status(400).json({ message: 'All boxes are booked for this slot. Please choose another time.' });

    if (isLockedByOther(turfId, date, timeSlot, req.user._id))
      return res.status(409).json({ message: 'This slot is temporarily held by another user. Please wait a moment and try again.' });

    const slotPrice = turf.slotPricing?.get?.(timeSlot) || turf.pricePerHour;

    const booking = await Booking.create({
      user: req.user._id, turf: turfId, box: freeBox._id,
      date, timeSlot, totalPrice: slotPrice,
      playerName: playerName || req.user.name,
      playerPhone: playerPhone || req.user.phone,
    });

    releaseLock(turfId, date, timeSlot, req.user._id);

    await booking.populate([
      { path: 'turf', select: 'name location contactNumber owner' },
      { path: 'box', select: 'name' },
    ]);

    await Notification.create({
      owner: turf.owner,
      message: `New booking at ${turf.name} — ${booking.playerName} on ${booking.date} (${booking.timeSlot})`,
      bookingId: booking._id,
    });

    try {
      const owner = await User.findById(turf.owner).select('pushSubscription');
      if (owner?.pushSubscription) {
        await webpush.sendNotification(owner.pushSubscription, JSON.stringify({
          title: `New Booking at ${turf.name}`,
          body: `${booking.playerName} booked on ${booking.date} (${booking.timeSlot})`,
        }));
      }
    } catch (pushErr) { console.error('Push notification failed:', pushErr.message); }

    try {
      const owner = await User.findById(turf.owner).select('email name');
      if (owner?.email) {
        await sendEmail(owner.email, `New Booking at ${turf.name}`, `
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
        `);
      }
    } catch (emailErr) { console.error('Owner notification email failed:', emailErr.message); }

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('turf', 'name location images pricePerHour slotPricing')
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
    notifyWaitlist(booking.turf, booking.date, booking.timeSlot);
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id/reschedule  { date, timeSlot }
exports.rescheduleBooking = async (req, res) => {
  try {
    const { date, timeSlot } = req.body;
    if (!date || !timeSlot) return res.status(400).json({ message: 'date and timeSlot are required' });

    const booking = await Booking.findById(req.params.id).populate('turf');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (booking.status === 'cancelled')
      return res.status(400).json({ message: 'Cannot reschedule a cancelled booking' });

    const turf = booking.turf;

    // Check a box is available for the new slot
    const boxes = await Box.find({ turf: turf._id, isActive: true, timeSlots: timeSlot });
    if (!boxes.length)
      return res.status(400).json({ message: 'No boxes available for the new slot' });

    const bookedBoxIds = await Booking.find({
      turf: turf._id, date, timeSlot,
      status: { $ne: 'cancelled' },
      _id: { $ne: booking._id },
    }).distinct('box');

    const freeBox = boxes.find(b => !bookedBoxIds.map(String).includes(String(b._id)));
    if (!freeBox)
      return res.status(400).json({ message: 'All boxes are booked for that slot. Please choose another time.' });

    const oldDate = booking.date;
    const oldSlot = booking.timeSlot;

    // Update booking
    const slotPrice = turf.slotPricing?.get?.(timeSlot) || turf.pricePerHour;
    booking.date = date;
    booking.timeSlot = timeSlot;
    booking.box = freeBox._id;
    booking.totalPrice = slotPrice;
    await booking.save();

    // Notify waitlist for the old slot (it just freed up)
    notifyWaitlist(turf._id, oldDate, oldSlot);

    await booking.populate([{ path: 'turf', select: 'name location' }, { path: 'box', select: 'name' }]);
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/slots?turfId=&date=
exports.getBookedSlots = async (req, res) => {
  try {
    const { turfId, date } = req.query;
    const boxes = await Box.find({ turf: turfId, isActive: true });
    if (!boxes.length) return res.json([]);
    const allSlots = [...new Set(boxes.flatMap(b => b.timeSlots))];
    const bookings = await Booking.find({ turf: turfId, date, status: { $ne: 'cancelled' } }).select('timeSlot box');
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

// POST /api/bookings/lock
exports.lockSlot = async (req, res) => {
  try {
    const { turfId, date, timeSlot } = req.body;
    if (!turfId || !date || !timeSlot)
      return res.status(400).json({ message: 'turfId, date and timeSlot are required' });
    const result = acquireLock(turfId, date, timeSlot, req.user._id);
    if (!result.ok)
      return res.status(409).json({ message: 'Slot is temporarily held by another user', expiresAt: result.expiresAt });
    res.json({ locked: true, expiresAt: result.expiresAt, ttlMs: LOCK_TTL_MS });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/bookings/lock
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
exports.getSlotLocks = async (req, res) => {
  try {
    const { turfId, date } = req.query;
    if (!turfId || !date) return res.status(400).json({ message: 'turfId and date are required' });
    res.json(getLocksForTurfDate(turfId, date));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bookings/waitlist  { turfId, date, timeSlot }
exports.joinWaitlist = async (req, res) => {
  try {
    const { turfId, date, timeSlot } = req.body;
    if (!turfId || !date || !timeSlot)
      return res.status(400).json({ message: 'turfId, date and timeSlot are required' });
    const entry = await Waitlist.findOneAndUpdate(
      { turf: turfId, date, timeSlot, user: req.user._id },
      { notified: false },
      { upsert: true, new: true }
    );
    res.json({ message: "You're on the waitlist! We'll notify you if a slot opens.", entry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/bookings/waitlist  { turfId, date, timeSlot }
exports.leaveWaitlist = async (req, res) => {
  try {
    const { turfId, date, timeSlot } = req.body;
    await Waitlist.deleteOne({ turf: turfId, date, timeSlot, user: req.user._id });
    res.json({ message: 'Removed from waitlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/waitlist?turfId=&date=  — returns slots user is waiting on
exports.getMyWaitlist = async (req, res) => {
  try {
    const { turfId, date } = req.query;
    const filter = { user: req.user._id };
    if (turfId) filter.turf = turfId;
    if (date) filter.date = date;
    const entries = await Waitlist.find(filter);
    // Return as a set of "slot" strings for easy lookup
    res.json(entries.map(e => ({ slot: e.timeSlot, date: e.date, turf: e.turf })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
