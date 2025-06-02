import React from 'react';

const OfferList = ({ offers, startChat, reportDispute }) => {
  return (
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
  );
};

export default OfferList;
