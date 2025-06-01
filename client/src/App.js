import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const App = () => {
  const [offers, setOffers] = useState([]);
  const [filters, setFilters] = useState({ currency: '', payment: '', amount: '' });
  const [offerData, setOfferData] = useState({ sellCurrency: 'USDT', sellAmount: '', buyCurrency: 'RUB', paymentMethod: 'Bank', contact: '' });
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    const res = await axios.get('http://localhost:5000/api/offers', { params: filters });
    setOffers(res.data);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleOfferChange = (e) => {
    setOfferData({ ...offerData, [e.target.name]: e.target.value });
  };

  const submitOffer = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/offers', offerData);
    fetchOffers();
    setOfferData({ sellCurrency: 'USDT', sellAmount: '', buyCurrency: 'RUB', paymentMethod: 'Bank', contact: '' });
  };

  const startChat = async (offerId) => {
    setSelectedOffer(offerId);
    const res = await axios.get(`http://localhost:5000/api/messages/${offerId}`);
    setChatMessages(res.data);
  };

  const sendMessage = async () => {
    await axios.post(`http://localhost:5000/api/messages`, { offerId: selectedOffer, message: newMessage });
    setNewMessage('');
    startChat(selectedOffer);
  };

  const contactSupport = async () => {
    const res = await axios.post('http://localhost:5000/api/support', { message: supportMessage });
    if (supportMessage.toLowerCase().includes('оператор')) {
      alert('Оператор уведомлен, скоро ответит!');
    } else {
      alert(res.data.reply);
    }
    setSupportMessage('');
  };

  const reportDispute = async (offerId) => {
    await axios.post(`http://localhost:5000/api/offers/${offerId}/dispute`);
    alert('Средства заморожены, спор открыт!');
    fetchOffers();
  };

  return (
    <div className="container">
      <h1>Простой P2P Обменник</h1>
      <div className="form-container">
        <h2>Создать заявку</h2>
        <form onSubmit={submitOffer}>
          <label>Продаю:</label>
          <select name="sellCurrency" value={offerData.sellCurrency} onChange={handleOfferChange}>
            <option value="USDT">USDT</option>
            <option value="BTC">BTC</option>
            <option value="RUB">RUB</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <label>Сумма:</label>
          <input type="number" name="sellAmount" value={offerData.sellAmount} onChange={handleOfferChange} required />
          <label>Покупаю:</label>
          <select name="buyCurrency" value={offerData.buyCurrency} onChange={handleOfferChange}>
            <option value="RUB">RUB</option>
            <option value="USDT">USDT</option>
            <option value="BTC">BTC</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <label>Метод оплаты:</label>
          <select name="paymentMethod" value={offerData.paymentMethod} onChange={handleOfferChange}>
            <option value="Bank">Банковская карта</option>
            <option value="Payeer">Payeer</option>
            <option value="AdvCash">AdvCash</option>
            <option value="PayPal">PayPal</option>
            <option value="Wise">Wise</option>
          </select>
          <label>Контакт:</label>
          <input type="text" name="contact" value={offerData.contact} onChange={handleOfferChange} required />
          <button type="submit">Создать заявку</button>
        </form>
      </div>
      <div className="form-container">
        <h2>Фильтры</h2>
        <select name="currency" onChange={handleFilterChange}>
          <option value="">Все валюты</option>
          <option value="USDT">USDT</option>
          <option value="BTC">BTC</option>
          <option value="RUB">RUB</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
        <select name="payment" onChange={handleFilterChange}>
          <option value="">Все методы</option>
          <option value="Bank">Банковская карта</option>
          <option value="Payeer">Payeer</option>
          <option value="AdvCash">AdvCash</option>
          <option value="PayPal">PayPal</option>
          <option value="Wise">Wise</option>
        </select>
        <input type="number" name="amount" placeholder="Мин. сумма" onChange={handleFilterChange} />
        <button onClick={fetchOffers}>Применить фильтры</button>
      </div>
      <div className="offers-container">
        <h2>Текущие заявки</h2>
        <table>
          <thead>
            <tr>
              <th>Продаю</th>
              <th>Сумма</th>
              <th>Покупаю</th>
              <th>Метод</th>
              <th>Контакт</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(offer => (
              <tr key={offer._id}>
                <td>{offer.sellCurrency}</td>
                <td>{offer.sellAmount}</td>
                <td>{offer.buyCurrency}</td>
                <td>{offer.paymentMethod}</td>
                <td>{offer.contact}</td>
                <td>
                  <button onClick={() => startChat(offer._id)}>Чат</button>
                  <button onClick={() => reportDispute(offer._id)}>Спор</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedOffer && (
        <div className="chat-container">
          <h2>Чат по заявке</h2>
          <div>
            {chatMessages.map((msg, index) => (
              <p key={index}>{msg.message}</p>
            ))}
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение..."
          />
          <button onClick={sendMessage}>Отправить</button>
        </div>
      )}
      <div className="support-container">
        <h2>Поддержка</h2>
        <input
          type="text"
          value={supportMessage}
          onChange={(e) => setSupportMessage(e.target.value)}
          placeholder="Опишите проблему..."
        />
        <button onClick={contactSupport}>Связаться</button>
      </div>
    </div>
  );
};

export default App;
