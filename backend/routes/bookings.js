const router = require('express').Router();
const { protect, ownerOnly } = require('../middleware/auth');
const {
  createBooking, getMyBookings, getOwnerBookings, cancelBooking, getBookedSlots,
  lockSlot, unlockSlot, getSlotLocks,
} = require('../controllers/bookingController');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/owner', protect, ownerOnly, getOwnerBookings);
router.get('/slots', getBookedSlots);
router.get('/locks', getSlotLocks);
router.post('/lock', protect, lockSlot);
router.delete('/lock', protect, unlockSlot);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
