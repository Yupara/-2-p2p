import React, { useState } from 'react';
import axios from 'axios';

const Chat = ({ offerId, messages, fetchMessages }) => {
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = async () => {
    await axios.post(`${process.env.REACT_APP_API_URL}/api/messages`, { offerId, message: newMessage });
    setNewMessage('');
    fetchMessages(offerId);
  };

  return (
    <div className="chat-container">
      <h2>Чат по заявке</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
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
  );
};

export default Chat;
