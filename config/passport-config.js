require("dotenv").config(); // Load environment variables at the beginning

const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcrypt");
const User = require("../models/User");

function initialize(passport) {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          const user = await User.findById(jwtPayload.sub);
          if (!user) {
            return done(null, false);
          }
          done(null, user);
        } catch (error) {
          done(error);
        }
      },
    ),
  );

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          const isValid = bcrypt.compare(password, user.password); // Add `await`
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://blogapi-1jcl.onrender.com/auth/google/callback",
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
      },
    ),
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "https://blogapi-1jcl.onrender.com/auth/github/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const { id, emails, username } = profile;

        try {
          let email = emails && emails[0] && emails[0].value;
          let user = await User.findOne({ email: email || "" });

          if (user) {
            if (!user.githubId) {
              user.githubId = id;
              await user.save();
            }
            return done(null, user);
          }

          user = new User({
            username: username,
            email: email || "",
            githubId: id,
          });

          await user.save();
          done(null, user);
        } catch (error) {
          console.error("GitHub authentication error:", error);
          done(error);
        }
      },
    ),
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
