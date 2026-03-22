const router = require('express').Router();
const { protect, ownerOnly } = require('../middleware/auth');
const {
  getBoxes, addBox, updateBox, deleteBox, getAvailability,
} = require('../controllers/boxController');

// Turf-scoped
router.get('/turfs/:turfId/boxes', getBoxes);
router.get('/turfs/:turfId/availability', getAvailability);
router.post('/turfs/:turfId/boxes', protect, ownerOnly, addBox);

// Box-level
router.put('/boxes/:id', protect, ownerOnly, updateBox);
router.delete('/boxes/:id', protect, ownerOnly, deleteBox);

module.exports = router;
