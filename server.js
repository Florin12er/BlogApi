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
    "https://blogs-nine-steel.vercel.app",
    "https://blogapi-production-fb2f.up.railway.app",
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
app.use(
  session({
    secret: "keyboard cat",
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
