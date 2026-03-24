const router = require('express').Router();
const { protect, ownerOnly } = require('../middleware/auth');
const {
  createBooking, getMyBookings, getOwnerBookings, cancelBooking,
  rescheduleBooking, getBookedSlots, lockSlot, unlockSlot, getSlotLocks,
  joinWaitlist, leaveWaitlist, getMyWaitlist,
} = require('../controllers/bookingController');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/owner', protect, ownerOnly, getOwnerBookings);
router.get('/slots', getBookedSlots);
router.get('/locks', getSlotLocks);
router.post('/lock', protect, lockSlot);
router.delete('/lock', protect, unlockSlot);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/reschedule', protect, rescheduleBooking);
router.post('/waitlist', protect, joinWaitlist);
router.delete('/waitlist', protect, leaveWaitlist);
router.get('/waitlist', protect, getMyWaitlist);

module.exports = router;
