const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Donor = require('../models/Donor');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');

router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'No token provided' });

    const donor = await Donor.findOne({ invite_token: token });
    if (donor) {
      if (donor.invite_token_expires < new Date()) {
        return res.status(400).json({ message: 'This invitation link has expired. Please ask your Super Admin to resend it.' });
      }
      return res.json({ name: donor.full_name, email: donor.email, type: 'donor' });
    }

    const profile = await StudentProfile.findOne({ invite_token: token }).populate('user_id');
    if (profile) {
      if (profile.invite_token_expires < new Date()) {
        return res.status(400).json({ message: 'This invitation link has expired. Please ask your school to resend it.' });
      }
      return res.json({ name: profile.user_id.name, email: profile.user_id.email, type: 'student' });
    }

    res.status(400).json({ message: 'This invitation link is invalid.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to verify invitation' });
  }
});

router.post('/complete', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    const donor = await Donor.findOne({ invite_token: token });
    if (donor) {
      if (donor.invite_token_expires < new Date()) {
        return res.status(400).json({ message: 'This invitation link has expired.' });
      }
      const existing = await User.findOne({ email: donor.email });
      if (existing) {
        return res.status(400).json({ message: 'An account with this email already exists. Try logging in directly.' });
      }
      const password_hash = await bcrypt.hash(password, 10);
      const user = await User.create({ name: donor.full_name, email: donor.email, password_hash, role: 'donor', assigned_country: donor.country });
      donor.user_id = user._id;
      donor.account_status = 'active';
      donor.invite_token = null;
      donor.invite_token_expires = null;
      await donor.save();
      return res.json({ message: 'Account created. You can now log in.' });
    }

    const profile = await StudentProfile.findOne({ invite_token: token });
    if (profile) {
      if (profile.invite_token_expires < new Date()) {
        return res.status(400).json({ message: 'This invitation link has expired.' });
      }
      const password_hash = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(profile.user_id, { password_hash });
      profile.account_status = 'active';
      profile.invite_token = null;
      profile.invite_token_expires = null;
      await profile.save();
      return res.json({ message: 'Account created. You can now log in.' });
    }

    res.status(400).json({ message: 'This invitation link is invalid.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to complete account setup' });
  }
});

module.exports = router;