const Turf = require('../models/Turf');

exports.getAllTurfs = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, search } = req.query;
    let query = { isActive: true };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
    ];
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }
    const turfs = await Turf.find(query).populate('owner', 'name email phone').sort('-createdAt');
    res.json(turfs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTurf = async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id).populate('owner', 'name email phone').populate('reviews.user', 'name');
    if (!turf) return res.status(404).json({ message: 'Turf not found' });
    res.json(turf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTurf = async (req, res) => {
  try {
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const turf = await Turf.create({ ...req.body, owner: req.user._id, images });
    res.status(201).json(turf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTurf = async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) return res.status(404).json({ message: 'Turf not found' });
    if (turf.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    const newImages = req.files?.length ? req.files.map(f => `/uploads/${f.filename}`) : turf.images;
    const updated = await Turf.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images: newImages },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTurf = async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) return res.status(404).json({ message: 'Turf not found' });
    if (turf.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await turf.deleteOne();
    res.json({ message: 'Turf deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOwnerTurfs = async (req, res) => {
  try {
    const turfs = await Turf.find({ owner: req.user._id }).sort('-createdAt');
    res.json(turfs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const turf = await Turf.findById(req.params.id);
    if (!turf) return res.status(404).json({ message: 'Turf not found' });
    const already = turf.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: 'Already reviewed' });
    turf.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    turf.numReviews = turf.reviews.length;
    turf.rating = turf.reviews.reduce((a, r) => a + r.rating, 0) / turf.reviews.length;
    await turf.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
