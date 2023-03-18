
require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const GOOGLE_CLIENT_ID = "403330831846-up2facucmnh5gvs4420uact6hqs3qsfb.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passport.use(new GoogleStrategy({
  clientID: "403330831846-up2facucmnh5gvs4420uact6hqs3qsfb.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "/login/google",
  passReqToCallback: true,
},
function(request, accessToken, refreshToken, profile, done) {
  return done(null, profile);
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
