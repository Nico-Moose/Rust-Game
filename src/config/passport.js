const passport = require('passport');
const TwitchStrategy = require('passport-twitch-new').Strategy;
const playerService = require('../services/playerService');

const clientID = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const callbackURL = process.env.TWITCH_CALLBACK_URL;

if (clientID && clientSecret && callbackURL) {
  passport.use(
    new TwitchStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope: 'user:read:email'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const player = playerService.findOrCreateFromTwitchProfile(profile);
          return done(null, player);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
} else {
  console.warn('[AUTH] Twitch credentials are missing. OAuth routes will not work until .env is filled.');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  try {
    const player = playerService.getPlayerById(id);
    done(null, player || false);
  } catch (error) {
    done(error);
  }
});
