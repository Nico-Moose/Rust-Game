const path = require('path');
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const passport = require('passport');

require('./src/config/env');
require('./src/config/passport');

const authRoutes = require('./src/routes/authRoutes');
const playerRoutes = require('./src/routes/playerRoutes');
const craftRoutes = require('./src/routes/craftRoutes');
const rewardRoutes = require('./src/routes/rewardRoutes');
const mapRoutes = require('./src/routes/mapRoutes');
const { attachPlayerToLocals } = require('./src/middleware/authMiddleware');
const { ensureDbReady } = require('./src/db/initDb');

const app = express();
const PORT = Number(process.env.PORT || 3000);

ensureDbReady();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(attachPlayerToLocals);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ ok: true, app: 'moose-rust-stage1', uptime: process.uptime() });
});

app.use('/auth', authRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/craft', craftRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/map', mapRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('[APP ERROR]', err);
  const status = err.message && err.message.includes('перезарядке') ? 429 : 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[WEB] Moose Rust stage 1 running on port ${PORT}`);
});
