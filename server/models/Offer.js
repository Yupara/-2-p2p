const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  sellCurrency: String,
  sellAmount: Number,
  buyCurrency: String,
  paymentMethod: String,
  contact: String,
  userId: String,
  status: { type: String, default: 'active' }, // active, disputed, completed
  commissionPaid: { type: Boolean, default: false }
});

module.exports = mongoose.model('Offer', OfferSchema);
