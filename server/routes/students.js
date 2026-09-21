const express = require('express');
const router = express.Router();
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const { authenticate, authorize } = require('../middleware/auth');

// A student views their OWN application — never anyone else's
router.get('/me/application', authenticate, authorize('student'), async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user_id: req.user.userId });
    if (!profile) {
      return res.status(404).json({ message: 'No student profile found for this account' });
    }

    const application = await Application.findOne({ student_id: profile._id })
      .populate('offer_id');

    res.json({ profile, application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch your application' });
  }
});

module.exports = router;