const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getMatches, getMatch, createMatch, joinMatch, leaveMatch, cancelMatch,
} = require('../controllers/matchController');

router.get('/', getMatches);
router.get('/:id', getMatch);
router.post('/', protect, createMatch);
router.post('/:id/join', protect, joinMatch);
router.delete('/:id/join', protect, leaveMatch);
router.delete('/:id', protect, cancelMatch);

module.exports = router;
