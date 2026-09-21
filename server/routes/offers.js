const express = require('express');
const router = express.Router();
const ScholarshipOffer = require('../models/ScholarshipOffer');
const { authenticate, authorize } = require('../middleware/auth');

// GET all offers — any logged-in user can view (School Admins need this list too, for the dropdown)
router.get('/', authenticate, async (req, res) => {
  try {
    const offers = await ScholarshipOffer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch offers' });
  }
});

// POST a new offer — ONLY super_admin, per FR-04
router.post('/', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { country, university, offer_type, total_seats, majors } = req.body;

    const offer = await ScholarshipOffer.create({
      user_id: req.user.userId, // comes from the token, not the request body — can't be faked
      country,
      university,
      offer_type,
      total_seats,
      majors
    });

    res.status(201).json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create offer' });
  }
});

module.exports = router;