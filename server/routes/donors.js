const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { generateInviteToken } = require('../utils/inviteToken');
const { sendInviteEmail } = require('../utils/sendEmail');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.get('/', authenticate, async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch donors' });
  }
});

router.post('/', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { full_name, email, country, phone } = req.body;

    const donor = await Donor.create({ full_name, email, country, phone, created_by: req.user.userId });

    // If this email already has a login, link directly — no invite needed or possible.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      donor.user_id = existingUser._id;
      donor.account_status = 'active';
      await donor.save();
      return res.status(201).json(donor);
    }

    const { token, expires } = generateInviteToken();
    donor.invite_token = token;
    donor.invite_token_expires = expires;
    await donor.save();

    const setupLink = `${FRONTEND_URL}/create-account?token=${token}`;
    try {
      await sendInviteEmail(email, full_name, setupLink);
    } catch (emailErr) {
      console.error('Invite email failed (donor was still created):', emailErr.message);
    }

    res.status(201).json(donor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create donor' });
  }
});

module.exports = router;