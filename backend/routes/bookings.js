const router = require('express').Router();
const { protect, ownerOnly } = require('../middleware/auth');
const { createBooking, getMyBookings, getOwnerBookings, cancelBooking, getBookedSlots } = require('../controllers/bookingController');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/owner', protect, ownerOnly, getOwnerBookings);
router.get('/slots', getBookedSlots);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
