const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  dob: { type: Date, required: true },
  phone: { type: String, required: true },
  passport_url: { type: String },
  certificate_url: { type: String },
  gpa: { type: Number, required: true, min: 0, max: 100 },
  major: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);