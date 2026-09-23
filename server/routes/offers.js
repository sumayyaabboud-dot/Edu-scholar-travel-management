const express = require('express');
const router = express.Router();
const ScholarshipOffer = require('../models/ScholarshipOffer');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const offers = await ScholarshipOffer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch offers' });
  }
});

router.post('/', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { country, university, offer_type, total_seats, majors } = req.body;

    const offer = await ScholarshipOffer.create({
      user_id: req.user.userId,
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

// Super Admin edits an existing offer. Country is intentionally not editable here —
// it's the field donors key off of, so changing it after publishing would be a bigger,
// separate decision than a simple edit.
router.patch('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { university, offer_type, total_seats, majors, status } = req.body;

    const offer = await ScholarshipOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (university !== undefined) offer.university = university;
    if (offer_type !== undefined) offer.offer_type = offer_type;
    if (total_seats !== undefined) offer.total_seats = total_seats;
    if (majors !== undefined) offer.majors = majors;
    if (status !== undefined) offer.status = status;

    await offer.save();
    res.json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update offer' });
  }
});

module.exports = router;