const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  dob: { type: Date, required: true },
  phone: { type: String, required: true },
  passport_url: { type: String },
  certificate_url: { type: String },
  gpa: { type: Number, required: true, min: 0, max: 100 },
  major: { type: String, required: true },
    questionCount: { type: Number, default: 0 },
  questionCountResetAt: { type: Date, default: Date.now },
    account_status: { type: String, enum: ['pending', 'active'], default: 'active' },
  invite_token: { type: String, default: null },
  invite_token_expires: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);