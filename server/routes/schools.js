const express = require('express');
const router = express.Router();
const School = require('../models/School');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/me', authenticate, authorize('school_admin'), async (req, res) => {
  try {
    const school = await School.findById(req.user.school_id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json(school);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch school' });
  }
});

module.exports = router;