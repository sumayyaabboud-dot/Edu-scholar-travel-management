const express = require('express');
const router = express.Router();
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const bcrypt = require('bcrypt');
const { authenticate, authorize } = require('../middleware/auth');
const ScholarshipOffer = require('../models/ScholarshipOffer');
const { calculateMatchScore } = require('../utils/matchScore');
const { generateApplicationsPDF } = require('../utils/generatePDF');
const { verifyDocument } = require('../utils/ocrVerification');
const upload = require('../middleware/upload');
const TravelBooking = require('../models/TravelBooking');
function tierFromGPA(gpa) {
  if (gpa < 70) return 'Rejected';
  if (gpa <= 85) return 'Partial';
  return 'Full';
}

router.post('/', authenticate, authorize('school_admin'), async (req, res) => {
  try {
    const { name, email, dob, phone, gpa, major, offer_id } = req.body;

    const tempPasswordHash = await bcrypt.hash('Welcome123!', 10);
    const studentUser = await User.create({
      name, email, password_hash: tempPasswordHash, role: 'student'
    });

    const profile = await StudentProfile.create({
      user_id: studentUser._id,
      school_id: req.user.school_id,
      dob, phone, gpa, major
    });

    const tier = tierFromGPA(gpa);
    const status = tier === 'Rejected' ? 'Rejected' : 'Pending';
        const offer = await ScholarshipOffer.findById(offer_id);
    const matchScore = calculateMatchScore(gpa, major, offer.majors);
    const ocrResult = verifyDocument(gpa);
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

    res.status(201).json({ application, tier });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

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

router.get('/', authenticate, authorize('school_admin'), async (req, res) => {
  try {
       const applications = await Application.find({ school_id: req.user.school_id })
      .populate({ path: 'student_id', populate: { path: 'user_id' } })
      .populate('offer_id')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch applications' });
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

module.exports = router;