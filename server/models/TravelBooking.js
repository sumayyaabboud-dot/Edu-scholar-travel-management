const mongoose = require('mongoose');

const travelBookingSchema = new mongoose.Schema({
  app_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  visa_discount: { type: Number, required: true },   // e.g. 30 or 15 (percent)
  housing_discount: { type: Number, required: true }, // e.g. 40 or 20 (percent)
  airline: { type: String, default: 'Middle East Airlines' },
  status: {
    type: String,
    enum: ['Awaiting Visa', 'Confirmed'],
    default: 'Awaiting Visa'
  }
}, { timestamps: true });

module.exports = mongoose.model('TravelBooking', travelBookingSchema);