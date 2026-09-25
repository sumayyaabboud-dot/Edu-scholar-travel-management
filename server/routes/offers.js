const express = require('express');
const router = express.Router();
const ScholarshipOffer = require('../models/ScholarshipOffer');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const offers = await ScholarshipOffer.find().populate('donor_id').sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch offers' });
  }
});

router.post('/', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { country, university, offer_type, total_seats, majors, donor_id } = req.body;

    const offer = await ScholarshipOffer.create({
      user_id: req.user.userId,
      country,
      university,
      offer_type,
      total_seats,
      majors,
      donor_id: donor_id || null
    });

    res.status(201).json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create offer' });
  }
});

router.patch('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { university, offer_type, total_seats, majors, status, donor_id } = req.body;

    const offer = await ScholarshipOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (university !== undefined) offer.university = university;
    if (offer_type !== undefined) offer.offer_type = offer_type;
    if (total_seats !== undefined) offer.total_seats = total_seats;
    if (majors !== undefined) offer.majors = majors;
    if (status !== undefined) offer.status = status;
    if (donor_id !== undefined) offer.donor_id = donor_id || null;

    await offer.save();
    res.json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update offer' });
  }
});

module.exports = router;