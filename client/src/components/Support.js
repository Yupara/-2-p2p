import React, { useState } from 'react';
import axios from 'axios';

const Support = () => {
  const [supportMessage, setSupportMessage] = useState('');

  const contactSupport = async () => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/support`, { message: supportMessage });
    if (supportMessage.toLowerCase().includes('оператор')) {
      alert('Оператор уведомлён, скоро ответит!');
    } else {
      alert(res.data.reply);
    }
    setSupportMessage('');
  };

  return (
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
  );
};

export default Support;
