const express = require('express');
const router = express.Router();
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const TravelBooking = require('../models/TravelBooking');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { authenticate, authorize } = require('../middleware/auth');
const ScholarshipOffer = require('../models/ScholarshipOffer');
const { calculateMatchScore } = require('../utils/matchScore');
const { verifyDocument } = require('../utils/ocrVerification');
const { generateApplicationsPDF } = require('../utils/generatePDF');
const upload = require('../middleware/upload');
const { generateInviteToken } = require('../utils/inviteToken');
const { sendInviteEmail } = require('../utils/sendEmail');

function tierFromGPA(gpa) {
  if (gpa < 70) return 'Rejected';
  if (gpa <= 85) return 'Partial';
  return 'Full';
}

// School Admin submits an application on behalf of a student — FR-01, FR-02, FR-03
router.post('/', authenticate, authorize('school_admin'), async (req, res) => {
  try {
    const { name, email, dob, phone, gpa, major, offer_id } = req.body;

    const offer = await ScholarshipOffer.findById(offer_id);
    if (!offer) {
      return res.status(404).json({ message: 'Selected offer not found' });
    }

    // A random, unguessable placeholder — never given to the student, never usable to log in.
    // The account stays 'pending' until they set their own password via the invite link.
    const placeholderPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    const studentUser = await User.create({
      name, email, password_hash: placeholderPasswordHash, role: 'student'
    });

    const matchScore = calculateMatchScore(gpa, major, offer.majors);
    const ocrResult = verifyDocument(gpa);
    const { token, expires } = generateInviteToken();

    const profile = await StudentProfile.create({
      user_id: studentUser._id,
      school_id: req.user.school_id,
      dob, phone, gpa, major,
      account_status: 'pending',
      invite_token: token,
      invite_token_expires: expires
    });

    const tier = tierFromGPA(gpa);
    const status = tier === 'Rejected' ? 'Rejected' : 'Pending';

    const application = await Application.create({
      student_id: profile._id,
      offer_id,
      submitted_by: req.user.userId,
      school_id: req.user.school_id,
      tier,
      status,
      ai_match_score: matchScore,
      ocr_verified: ocrResult.verified
    });

    const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/create-account?token=${token}`;
    try {
      await sendInviteEmail(email, name, setupLink);
    } catch (emailErr) {
      console.error('Invite email failed (application was still created):', emailErr.message);
    }

    res.status(201).json({ application, tier });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

// School Admin views only THEIR OWN school's applications
router.get('/', authenticate, authorize('school_admin'), async (req, res) => {
  try {
    const applications = await Application.find({ school_id: req.user.school_id })
      .populate({ path: 'student_id', populate: [{ path: 'user_id' }, { path: 'school_id' }] })
      .populate('offer_id')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// School Admin views ONE application's full detail
router.get('/:id', authenticate, authorize('school_admin'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({ path: 'student_id', populate: { path: 'user_id' } })
      .populate('offer_id');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (String(application.school_id) !== String(req.user.school_id)) {
      return res.status(403).json({ message: 'This application does not belong to your school' });
    }

    res.json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch application' });
  }
});

// School Admin deletes an application — cascades to the student's profile, login, and booking
router.delete('/:id', authenticate, authorize('school_admin'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (String(application.school_id) !== String(req.user.school_id)) {
      return res.status(403).json({ message: 'This application does not belong to your school' });
    }

    const profile = await StudentProfile.findById(application.student_id);

    await TravelBooking.deleteOne({ app_id: application._id });
    await Application.findByIdAndDelete(application._id);
    if (profile) {
      await User.findByIdAndDelete(profile.user_id);
      await StudentProfile.findByIdAndDelete(profile._id);
    }

    res.json({ message: 'Application deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete application' });
  }
});

// Upload a certificate file for an existing application's student
router.post('/:id/certificate', authenticate, authorize('school_admin'), upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (String(application.school_id) !== String(req.user.school_id)) {
      return res.status(403).json({ message: 'This application does not belong to your school' });
    }

    const profile = await StudentProfile.findById(application.student_id);
    profile.certificate_url = `/uploads/${req.file.filename}`;
    await profile.save();

    res.json({ certificate_url: profile.certificate_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload certificate' });
  }
});

// School Admin downloads a PDF of their own school's applications, to send to donors — Workflow Step 4
router.get('/report/pdf', authenticate, authorize('school_admin'), async (req, res) => {
  try {
    const applications = await Application.find({ school_id: req.user.school_id })
      .populate({ path: 'student_id', populate: { path: 'user_id' } })
      .populate('offer_id');

    generateApplicationsPDF(res, 'School Applications Report', applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

module.exports = router;