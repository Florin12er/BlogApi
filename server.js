const express = require("express");
const app = express();
const User = require("./models/User.js");
const cors = require("cors");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("./config/passport-config.js");

const corsOptions = {
  origin: "http://localhost:5173",
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
app.use(flash());

// Session middleware should be used before passport.session()
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Method override middleware
app.use(methodOverride("_method"));

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
