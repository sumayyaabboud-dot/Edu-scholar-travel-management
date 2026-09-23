const mongoose = require('mongoose');

const scholarshipOfferSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  country: { type: String, required: true },
  university: { type: String, required: true },
  offer_type: { type: String, required: true },
  total_seats: { type: Number, required: true },
  seats_allocated: { type: Number, default: 0 },
  majors: [{ type: String }],
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('ScholarshipOffer', scholarshipOfferSchema);