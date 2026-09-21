const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  offer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ScholarshipOffer', required: true },
  submitted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // School Admin
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },

  tier: {
    type: String,
    enum: ['Full', 'Partial', 'Rejected'],
    required: true
  }, // computed once from GPA, per FR-02/03

  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Granted', 'Waitlisted', 'Rejected'],
    default: 'Pending'
  }, // changes as the donor reviews it

  ai_match_score: { type: Number, min: 0, max: 100 },
  ocr_verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);