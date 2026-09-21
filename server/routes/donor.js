const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const ScholarshipOffer = require('../models/ScholarshipOffer');
const { authenticate, authorize } = require('../middleware/auth');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { sendStatusEmail } = require('../utils/sendEmail');
const { generateApplicationsPDF } = require('../utils/generatePDF');

// Donor's batch review queue — capped at 50, per your BRD workflow step 5
router.get('/applications', authenticate, authorize('donor'), async (req, res) => {
  try {
    const myOffers = await ScholarshipOffer.find({ country: req.user.assigned_country });
    const myOfferIds = myOffers.map(o => o._id);

    const applications = await Application.find({
      offer_id: { $in: myOfferIds },
      tier: { $ne: 'Rejected' },
      status: { $in: ['Pending', 'Under Review'] }
    })
      .populate('student_id')
      .populate('offer_id')
      .sort({ createdAt: 1 })
      .limit(50);

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch batch' });
  }
});

// Donor grants or waitlists ONE application
router.patch('/applications/:id/decision', authenticate, authorize('donor'), async (req, res) => {
  try {
    const { decision } = req.body;

    if (!['Granted', 'Waitlisted'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be Granted or Waitlisted' });
    }

    const application = await Application.findById(req.params.id).populate('offer_id');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.offer_id.country !== req.user.assigned_country) {
      return res.status(403).json({ message: 'This application is not in your assigned country' });
    }

    if (decision === 'Granted') {
      const offer = application.offer_id;
      if (offer.seats_allocated >= offer.total_seats) {
        return res.status(400).json({ message: 'No seats remaining on this offer' });
      }
      offer.seats_allocated += 1;
      await offer.save();
    }

    application.status = decision;
    await application.save();

    try {
      const profile = await StudentProfile.findById(application.student_id);
      const studentUser = await User.findById(profile.user_id);
      await sendStatusEmail(studentUser.email, studentUser.name, decision, application.offer_id.university);
    } catch (emailErr) {
      console.error('Email sending failed (decision was still saved):', emailErr.message);
    }

    res.json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to record decision' });
  }
});

// Donor downloads a PDF of their decisions, to send back to schools — Workflow Step 6
router.get('/report/pdf', authenticate, authorize('donor'), async (req, res) => {
  try {
    const myOffers = await ScholarshipOffer.find({ country: req.user.assigned_country });
    const myOfferIds = myOffers.map(o => o._id);

    const applications = await Application.find({
      offer_id: { $in: myOfferIds },
      status: { $in: ['Granted', 'Waitlisted'] }
    })
      .populate({ path: 'student_id', populate: { path: 'user_id' } })
      .populate('offer_id');

    generateApplicationsPDF(res, `Donor Decision Report - ${req.user.assigned_country}`, applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

module.exports = router;