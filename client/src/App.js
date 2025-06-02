import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OfferForm from './components/OfferForm';
import OfferList from './components/OfferList';
import Chat from './components/Chat';
import Support from './components/Support';
import './index.css';

const App = () => {
  const [offers, setOffers] = useState([]);
  const [filters, setFilters] = useState({ currency: '', payment: '', amount: '' });
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    fetchOffers();
  }, [filters]);

  const fetchOffers = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/offers`, { params: filters });
    setOffers(res.data);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const startChat = async (offerId) => {
    setSelectedOffer(offerId);
    fetchMessages(offerId);
  };

  const fetchMessages = async (offerId) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/messages/${offerId}`);
    setChatMessages(res.data);
  };

  const reportDispute = async (offerId) => {
    await axios.post(`${process.env.REACT_APP_API_URL}/api/offers/${offerId}/dispute`);
    alert('Средства заморожены, спор открыт!');
    fetchOffers();
  };

  return (
    <div className="container">
      <h1>Green P2P Exchange</h1>
      <OfferForm fetchOffers={fetchOffers} />
      <div className="form-container">
        <h2>Фильтры</h2>
        <select name="currency" onChange={handleFilterChange}>
          <option value="">Все валюты</option>
          <option value="USDT">USDT</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
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
          <option value="Revolut">Revolut</option>
        </select>
        <input type="number" name="amount" placeholder="Мин. сумма" onChange={handleFilterChange} />
        <button onClick={fetchOffers}>Применить</button>
      </div>
      <OfferList offers={offers} startChat={startChat} reportDispute={reportDispute} />
      {selectedOffer && <Chat offerId={selectedOffer} messages={chatMessages} fetchMessages={fetchMessages} />}
      <Support />
    </div>
  );
};

export default App;
