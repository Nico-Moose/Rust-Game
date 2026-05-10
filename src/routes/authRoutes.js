const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/me', (req, res) => {
  if (!req.user) {
    return res.json({ authenticated: false, player: null });
  }

  return res.json({ authenticated: true, player: req.user });
});

router.get('/twitch', (req, res, next) => {
  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET || !process.env.TWITCH_CALLBACK_URL) {
    return res.status(500).json({ error: 'Twitch OAuth is not configured in .env' });
  }

  return passport.authenticate('twitch')(req, res, next);
});

router.get(
  '/twitch/callback',
  passport.authenticate('twitch', { failureRedirect: '/?login=failed' }),
  (req, res) => {
    res.redirect('/game.html');
  }
);

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });
});

module.exports = router;
