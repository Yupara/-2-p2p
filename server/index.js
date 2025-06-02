const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const Offer = require('./models/Offer');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/p2p-exchange', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const bot = new TelegramBot('YOUR_TELEGRAM_BOT_TOKEN', { polling: true });
const ADMIN_CHAT_ID = 'YOUR_TELEGRAM_CHAT_ID';

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, 'secret');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/register', async (req, res) => {
  const { email, password, usdtWallet } = req.body;
  const user = new User({ userId: email, email, password, usdtWallet });
  await user.save();
  const token = jwt.sign({ userId: email }, 'secret', { expiresIn: '1h' });
  res.json({ token });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: email }, 'secret', { expiresIn: '1h' });
  res.json({ token });
});

app.get('/api/offers', async (req, res) => {
  const { currency, payment, amount } = req.query;
  let query = { status: 'active' };
  if (currency) query.sellCurrency = currency;
  if (payment) query.paymentMethod = payment;
  if (amount) query.sellAmount = { $gte: parseFloat(amount) };
  const offers = await Offer.find(query);
  res.json(offers);
});

app.post('/api/offers', authenticate, async (req, res) => {
  const offer = new Offer({ ...req.body, userId: req.userId });
  await offer.save();
  res.json(offer);
});

app.post('/api/offers/:id/dispute', authenticate, async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  offer.status = 'disputed';
  await offer.save();
  bot.sendMessage(ADMIN_CHAT_ID, `Спор по заявке ${req.params.id}`);
  res.json({ message: 'Спор открыт, средства заморожены' });
});

app.get('/api/messages/:offerId', authenticate, async (req, res) => {
  const messages = await Message.find({ offerId: req.params.offerId });
  res.json(messages);
});

app.post('/api/messages', authenticate, async (req, res) => {
  const message = new Message({ ...req.body, userId: req.userId });
  await message.save();
  res.json(message);
});

app.post('/api/support', async (req, res) => {
  const { message } = req.body;
  if (message.toLowerCase().includes('оператор')) {
    bot.sendMessage(ADMIN_CHAT_ID, `Запрос оператора: ${message}`);
    res.json({ reply: 'Оператор уведомлён' });
  } else {
    res.json({ reply: 'Это Grok, чем могу помочь? Опишите проблему подробнее.' });
  }
});

app.post('/api/complete-trade', authenticate, async (req, res) => {
  const { offerId, amount, currency } = req.body;
  const offer = await Offer.findById(offerId);
  let user = await User.findOne({ userId: req.userId });

  if (!user) {
    user = new User({ userId: req.userId, tradesCompleted: 0 });
  }
  user.tradesCompleted += 1;
  await user.save();

  const commissionRate = user.tradesCompleted >= 50 ? 0.0025 : 0.005;
  let commission = amount * commissionRate * 2; // Покупатель + продавец

  if (currency !== 'USDT') {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd');
    const prices = response.data;
    if (currency === 'BTC') commission = commission / prices.bitcoin.usd;
    if (currency === 'ETH') commission = commission / prices.ethereum.usd;
  }

  offer.status = 'completed';
  offer.commissionPaid = true;
  await offer.save();

  res.json({ commission, usdtWallet: user.usdtWallet });
});

app.listen(process.env.PORT || 5000, () => console.log('Server running'));
