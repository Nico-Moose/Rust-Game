const path = require('path');
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const passport = require('passport');

require('./src/config/env');
require('./src/config/passport');

const authRoutes = require('./src/routes/authRoutes');
const playerRoutes = require('./src/routes/playerRoutes');
const mapRoutes = require('./src/routes/mapRoutes');
const rewardRoutes = require('./src/routes/rewardRoutes');
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
  res.json({ ok: true, app: 'moose-rust-wasteland', uptime: process.uptime() });
});

app.use('/auth', authRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/rewards', rewardRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('[APP ERROR]', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`[WEB] Moose Rust starter running on port ${PORT}`);
});
