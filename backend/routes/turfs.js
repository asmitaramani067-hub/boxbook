const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { protect, ownerOnly } = require('../middleware/auth');
const {
  getAllTurfs, getTurf, createTurf, updateTurf, deleteTurf, getOwnerTurfs, addReview
} = require('../controllers/turfController');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', getAllTurfs);
router.get('/my', protect, ownerOnly, getOwnerTurfs);
router.get('/:id', getTurf);
router.post('/', protect, ownerOnly, upload.array('images', 5), createTurf);
router.put('/:id', protect, ownerOnly, upload.array('images', 5), updateTurf);
router.delete('/:id', protect, ownerOnly, deleteTurf);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
