const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/User");

function initialize(passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "No user with that email" });
        }

        if (!user.password) {
          return done(null, false, { message: "User registered with OAuth only" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Password incorrect" });
        }
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/user/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const { id, emails, displayName } = profile;

        try {
          let user = await User.findOne({ email: emails[0].value });

          if (user) {
            if (!user.googleId) {
              user.googleId = id;
              await user.save();
            }
            return done(null, user);
          }

          user = new User({
            username: displayName,
            email: emails[0].value,
            googleId: id,
          });

          await user.save();
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/user/auth/github/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const { id, emails, username } = profile;

        try {
          let user = await User.findOne({ email: emails ? emails[0].value : "" });

          if (user) {
            if (!user.githubId) {
              user.githubId = id;
              await user.save();
            }
            return done(null, user);
          }

          user = new User({
            username: username,
            email: emails ? emails[0].value : "",
            githubId: id,
          });

          await user.save();
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

module.exports = initialize;

