const mongoose = require('mongoose');

const scholarshipOfferSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Super Admin who created it
  country: { type: String, required: true },
  university: { type: String, required: true },
  offer_type: {
    type: String,
    enum: ['Full', 'Partial', 'Full + Partial'],
    required: true
  },
  total_seats: { type: Number, required: true },
  seats_allocated: { type: Number, default: 0 },
  majors: [{ type: String }] // array — e.g. 5 majors per university
}, { timestamps: true });

module.exports = mongoose.model('ScholarshipOffer', scholarshipOfferSchema);