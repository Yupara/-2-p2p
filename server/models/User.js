const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: String,
  email: String,
  password: String,
  tradesCompleted: { type: Number, default: 0 },
  usdtWallet: String // Для получения комиссий
});

module.exports = mongoose.model('User', UserSchema);
