const express = require("express");
const app = express();
const User = require("./models/User.js");
const cors = require("cors");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const initializePassport = require("./config/passport-config.js");

const corsOptions = {
  origin: [
    "https://blog-maker-two.vercel.app",
    "https://blogs-nine-steel.vercel.app",
    "https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?response_type=code&redirect_uri=https%3A%2F%2Fblogapi-production-fb2f.up.railway.app%2Fuser%2Fauth%2Fgoogle%2Fcallback&scope=profile%20email&client_id=962618277009-68tn6hdcv2mc6upm8o775rt11e42ose9.apps.googleusercontent.com&service=lso&o2v=2&ddm=0&flowName=GeneralOAuthFlow",
    "https://github.com/login/oauth/authorize?response_type=code&redirect_uri=https%3A%2F%2Fblogapi-production-fb2f.up.railway.app%2Fuser%2Fauth%2Fgithub%2Fcallback&scope=user%3Aemail&client_id=Ov23liYo0Lw0r3Y869gT",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Load environment variables
require("dotenv").config();

// Initialize Passport
initializePassport(
  passport,
  async (email) => await User.findOne({ email }),
  async (id) => await User.findById(id),
);

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Passport middleware
app.use(passport.initialize());

// Routes
const Users = require("./routes/users/users.js");
const Blogs = require("./routes/blogs/blogs.js");

app.use("/user", Users);
app.use("/blog", Blogs);

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
