const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  account_status: { type: String, enum: ['pending', 'active'], default: 'pending' },
  invite_token: { type: String, default: null },
  invite_token_expires: { type: Date, default: null },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);