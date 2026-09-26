const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = { userId: user._id, role: user.role, name: user.name, school_id: user.school_id, assigned_country: user.assigned_country };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15min' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

        res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, assigned_country: user.assigned_country, school_id: user.school_id }
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.post('/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const payload = { userId: decoded.userId, role: decoded.role, name: decoded.name, school_id: decoded.school_id, assigned_country: decoded.assigned_country };
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15min' });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

module.exports = router;