# Rust-Game full ready ZIP

Добавлены недостающие корневые файлы для запуска на bothost:
- server.js
- index.js
- package.json
- .env.example
- .gitignore

Что указывать на хостинге:
- Язык: Node.js
- Образ: node:20 Debian Slim
- Порт: 3000
- Главный файл: server.js
- Ветка: main

После загрузки в GitHub:
1. Скопировать `.env.example` в `.env`
2. Заполнить Twitch/WizeBot переменные
3. Выполнить `npm install`
4. Выполнить `npm run db:init`
5. Запустить `npm start`
