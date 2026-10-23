const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email: String,
  otp: String,
  expireAt: {
    type: Date,
    expires:0
  },
  purpose: {
      type: String,
      enum: ["register", "forgot-password", "change-email"],
      required: true
  },
},{timestamps: true});

const OtpVerification = mongoose.model('OtpVerification', schema, 'otp-verification');

module.exports = OtpVerification;