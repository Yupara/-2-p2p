import React, { useState } from 'react';
import axios from 'axios';

const OfferForm = ({ fetchOffers }) => {
  const [formData, setFormData] = useState({
    sellCurrency: 'USDT',
    sellAmount: '',
    buyCurrency: 'RUB',
    paymentMethod: 'Bank',
    contact: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitOffer = async (e) => {
    e.preventDefault();
    await axios.post(`${process.env.REACT_APP_API_URL}/api/offers`, formData);
    fetchOffers();
    setFormData({ sellCurrency: 'USDT', sellAmount: '', buyCurrency: 'RUB', paymentMethod: 'Bank', contact: '' });
  };

  return (
    <div className="form-container">
      <h2>Создать заявку</h2>
      <form onSubmit={submitOffer}>
        <label>Продаю:</label>
        <select name="sellCurrency" value={formData.sellCurrency} onChange={handleChange}>
          <option value="USDT">USDT</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="RUB">RUB</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
        <label>Сумма:</label>
        <input type="number" name="sellAmount" value={formData.sellAmount} onChange={handleChange} required />
        <label>Покупаю:</label>
        <select name="buyCurrency" value={formData.buyCurrency} onChange={handleChange}>
          <option value="RUB">RUB</option>
          <option value="USDT">USDT</option>
          <option value="BTC">BTC</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
        <label>Метод оплаты:</label>
        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
          <option value="Bank">Банковская карта</option>
          <option value="Payeer">Payeer</option>
          <option value="AdvCash">AdvCash</option>
          <option value="PayPal">PayPal</option>
          <option value="Wise">Wise</option>
          <option value="Revolut">Revolut</option>
        </select>
        <label>Контакт (Telegram, email):</label>
        <input type="text" name="contact" value={formData.contact} onChange={handleChange} required />
        <button type="submit">Создать заявку</button>
      </form>
    </div>
  );
};

export default OfferForm;
