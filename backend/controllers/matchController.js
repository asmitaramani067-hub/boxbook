const Match = require('../models/Match');

// GET /api/matches?city=&date=&status=&page=
exports.getMatches = async (req, res) => {
  try {
    const { city, date, status, page = 1 } = req.query;
    const filter = {};
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (date) filter.date = date;
    if (status) filter.status = status;

    // Auto-expire past open matches
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);
    await Match.updateMany(
      {
        status: 'open',
        $or: [
          { date: { $lt: today } },
          { date: today, time: { $lt: nowTime } },
        ],
      },
      { $set: { status: 'cancelled' } }
    );

    const limit = 12;
    const skip = (Number(page) - 1) * limit;

    const [matches, total] = await Promise.all([
      Match.find(filter)
        .populate('createdBy', 'name')
        .populate('players.user', 'name')
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(limit),
      Match.countDocuments(filter),
    ]);

    res.json({ matches, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/matches/:id
exports.getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('createdBy', 'name phone')
      .populate('players.user', 'name');
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/matches
exports.createMatch = async (req, res) => {
  try {
    const { title, city, location, date, time, matchType, totalPlayersNeeded, description } = req.body;
    const match = await Match.create({
      createdBy: req.user._id,
      title, city, location, date, time,
      matchType: matchType || 'Box Cricket',
      sport: 'Cricket',
      totalPlayersNeeded,
      description,
      players: [{ user: req.user._id }],
    });
    await match.populate('createdBy', 'name');
    res.status(201).json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/matches/:id/join
exports.joinMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (match.status === 'cancelled') return res.status(400).json({ message: 'Match is cancelled' });
    if (match.status === 'full') return res.status(400).json({ message: 'Match is already full' });

    const alreadyJoined = match.players.some(p => String(p.user) === String(req.user._id));
    if (alreadyJoined) return res.status(400).json({ message: 'You already joined this match' });

    match.players.push({ user: req.user._id });
    await match.save();
    await match.populate('players.user', 'name');
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/matches/:id/join  (leave match)
exports.leaveMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const isCreator = String(match.createdBy) === String(req.user._id);
    if (isCreator) return res.status(400).json({ message: 'Creator cannot leave. Cancel the match instead.' });

    match.players = match.players.filter(p => String(p.user) !== String(req.user._id));
    await match.save();
    res.json({ message: 'Left match successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/matches/:id  (cancel — creator only)
exports.cancelMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (String(match.createdBy) !== String(req.user._id))
      return res.status(403).json({ message: 'Only the creator can cancel this match' });

    match.status = 'cancelled';
    await match.save();
    res.json({ message: 'Match cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
