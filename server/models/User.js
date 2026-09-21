const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'school_admin', 'super_admin', 'donor', 'travel_agent'],
    required: true
  },
  assigned_country: { type: String, default: null },
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);