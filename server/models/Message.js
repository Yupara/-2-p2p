const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  offerId: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
