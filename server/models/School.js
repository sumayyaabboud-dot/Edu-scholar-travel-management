const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  school_name: { type: String, required: true },
  region: { type: String, required: true },
  contact_email: { type: String, required: true },
  phone_number: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);