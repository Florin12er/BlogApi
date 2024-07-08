const express = require("express");
const app = express();
const User = require("./models/User.js");
const cors = require("cors");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const initializePassport = require("./config/passport-config.js");
const session = require("express-session");

const corsOptions = {
  origin: [
    "https://blog-maker-two.vercel.app",
    "http://localhost:5174",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://blogs-florin12er-florin12ers-projects.vercel.app",
    "https://blogs-nine-steel.vercel.app",
    "https://blogapi-production-fb2f.up.railway.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Load environment variables
require("dotenv").config();

// Initialize Passport
initializePassport(passport);

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }, // Set secure cookie if using HTTPS
    proxy: true, // Set this to true if you're behind a reverse proxy (e.g., Heroku)
  }),
);
app.use(passport.initialize());

// Routes
const Users = require("./routes/users/users.js");
const Blogs = require("./routes/blogs/blogs.js");

app.use("/user", Users);
app.use("/blog", Blogs);

// GitHub authentication route
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

// GitHub callback route
app.get("/auth/github/callback", (req, res, next) => {
  passport.authenticate("github", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: err });
    }
    if (!user) {
      return res.status(401).json({ message: "Authentication failed", info });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed", error: err });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      // Determine which domain to redirect based on the request origin
      const redirectUrl =
        req.headers.origin === "https://blogs-nine-steel.vercel.app"
          ? "https://blogs-nine-steel.vercel.app/auth/github/callback"
          : "https://blog-maker-two.vercel.app/auth/github/callback";

      res.redirect(`${redirectUrl}?token=${token}`);
    });
  })(req, res, next);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

app.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: err });
    }
    if (!user) {
      return res.status(401).json({ message: "Authentication failed", info });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed", error: err });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      // Determine which domain to redirect based on the request origin
      const redirectUrl =
        req.headers.origin === "https://blogs-nine-steel.vercel.app"
          ? "https://blogs-nine-steel.vercel.app/auth/google/callback"
          : "https://blog-maker-two.vercel.app/auth/google/callback";

      res.redirect(`${redirectUrl}?token=${token}`);
    });
  })(req, res, next);
});

// MongoDB connection
const dbUrl = process.env.DATABASEURL;
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

