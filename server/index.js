const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const Offer = require('./models/Offer');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost/p2p-exchange', { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/api/offers', async (req, res) => {
  const { currency, payment, amount } = req.query;
  let query = {};
  if (currency) query.sellCurrency = currency;
  if (payment) query.paymentMethod = payment;
  if (amount) query.sellAmount = { $gte: parseFloat(amount) };
  const offers = await Offer.find(query);
  res.json(offers);
});

app.post('/api/offers', async (req, res) => {
  const offer = new Offer(req.body);
  await offer.save();
  res.json(offer);
});

app.post('/api/offers/:id/dispute', async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  offer.status = 'disputed';
  await offer.save();
  res.json({ message: 'Спор открыт, средства заморожены' });
});

app.get('/api/messages/:offerId', async (req, res) => {
  const messages = await Message.find({ offerId: req.params.id });
  res.json(messages);
});

app.post('/api/messages', async (req, res) => {
  const message = new Message(req.body);
  await message.save();
  res.json(message);
});

app.post('/api/support', async (req, res) => {
  const { message } = req.body;
  if (message.toLowerCase().includes('оператор')) {
    // Здесь должен быть код для уведомления тебя (например, через Telegram API)
    res.json({ reply: 'Оператор уведомлен' });
  } else {
    res.json({ reply: 'Это Grok, чем могу помочь? Опишите проблему подробнее.' });
  }
});

app.post('/api/complete-trade', async (req, res) => {
  const { offerId, userId, amount, currency } = req.body;
  const offer = await Offer.findById(offerId);
  let user = await User.findOne({ userId });

  if (!user) {
    user = new User({ userId, tradesCompleted: 0 });
  }
  user.tradesCompleted += 1;
  await user.save();

  const commissionRate = user.tradesCompleted >= 50 ? 0.0025 : 0.005;
  let commission = amount * commissionRate;

  if (currency !== 'USDT') {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=usd');
    const btcPrice = response.data.bitcoin.usd;
    commission = currency === 'BTC' ? (commission / btcPrice) : commission;
  }

  offer.status = 'completed';
  offer.commissionPaid = true;
  await offer.save();

  res.json({ commission });
});

app.listen(5000, () => console.log('Server running on port 5000'));
