const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const TravelBooking = require('../models/TravelBooking');
const { authenticate, authorize } = require('../middleware/auth');

// Discount rules straight from your BRD (FR-08 / FR-09)
const DISCOUNTS = {
  Full:    { visa_discount: 30, housing_discount: 40 },
  Partial: { visa_discount: 15, housing_discount: 20 }
};

// Travel Agency's queue — only students the donor has actually GRANTED
router.get('/queue', authenticate, authorize('travel_agent'), async (req, res) => {
  try {
       const grantedApplications = await Application.find({ status: 'Granted' })
      .populate({ path: 'student_id', populate: { path: 'user_id' } })
      .populate('offer_id')
      .sort({ updatedAt: -1 });

    // For each one, check if a booking already exists
    const results = await Promise.all(
      grantedApplications.map(async (app) => {
        const booking = await TravelBooking.findOne({ app_id: app._id });
        return { application: app, booking: booking || null };
      })
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch booking queue' });
  }
});

// Create the booking — discount is CALCULATED here, never sent by the client
router.post('/book/:applicationId', authenticate, authorize('travel_agent'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (application.status !== 'Granted') {
      return res.status(400).json({ message: 'This application has not been granted a seat yet' });
    }

    const existing = await TravelBooking.findOne({ app_id: application._id });
    if (existing) {
      return res.status(400).json({ message: 'This student already has a booking' });
    }

    const discount = DISCOUNTS[application.tier]; // tier is 'Full' or 'Partial' — never 'Rejected' here

    const booking = await TravelBooking.create({
      app_id: application._id,
      visa_discount: discount.visa_discount,
      housing_discount: discount.housing_discount
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Confirm a booking (Awaiting Visa -> Confirmed)
router.patch('/book/:bookingId/confirm', authenticate, authorize('travel_agent'), async (req, res) => {
  try {
    const booking = await TravelBooking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'Confirmed';
    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to confirm booking' });
  }
});

module.exports = router;