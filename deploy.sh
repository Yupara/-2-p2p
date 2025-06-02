#!/bin/bash
# Установка зависимостей и деплой на Railway
cd client
npm install
npm run build
cd ../server
npm install
echo "REACT_APP_API_URL=https://your-server-url.up.railway.app" > .env
echo "MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/p2p-exchange" >> .env
echo "PORT=5000" >> .env
echo "TELEGRAM_BOT_TOKEN=your-telegram-bot-token" >> .env
echo "ADMIN_CHAT_ID=your-telegram-chat-id" >> .env
