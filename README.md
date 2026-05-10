# Moose Rust: Wasteland — Stage 1 Playable Build

Рабочая Stage 1 версия mini-app игры под Twitch.

Что уже реализовано:
- Twitch OAuth
- старт игрока с камнем и факелом
- общий кулдаун добычи 5 минут
- добыча дерева, камня, серы, металла
- лут бочек с рандомом
- охота на животных
- инвентарь с прочностью инструментов
- крафт каменной кирки и каменного топора
- логи действий
- заглушка под WizeBot gold

## Быстрый старт
```bash
npm install
cp .env.example .env
npm run db:init
npm start
```

Главная страница игры: `/game.html`
