const express = require("express");
const path = require("path");
const app = express();
const User = require("./models/User.js");
const cors = require("cors");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const initializePassport = require("./config/passport-config.js");
const session = require("express-session");

// Load environment variables
require("dotenv").config();

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
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
};
app.use(cors(corsOptions));

// Initialize Passport
initializePassport(passport);

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    proxy: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
const Users = require("./routes/users/users.js");
const Blogs = require("./routes/blogs/blogs.js");

app.use("/user", Users);
app.use("/blog", Blogs);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Helper function for authentication
const authenticateAndRedirect = (strategy) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: "Authentication failed", info });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const redirectUrl = determineRedirectUrl(req.headers.origin, strategy);
    res.redirect(`${redirectUrl}?token=${token}`);
  })(req, res, next);
};

// Helper function to determine redirect URL
const determineRedirectUrl = (origin, strategy) => {
  const baseUrls = {
    "https://blogs-nine-steel.vercel.app": "https://blog-maker-two.vercel.app",
    "https://blog-maker-two.vercel.app": "https://blogs-nine-steel.vercel.app",
  };
  const baseUrl = baseUrls[origin] || "https://blogs-nine-steel.vercel.app";
  return `${baseUrl}/auth/${strategy}/callback`;
};

// GitHub authentication routes
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);
app.get("/auth/github/callback", authenticateAndRedirect("github"));

// Google authentication routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
app.get("/auth/google/callback", authenticateAndRedirect("google"));

// MongoDB connection
const dbUrl = process.env.DATABASEURL;
mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
