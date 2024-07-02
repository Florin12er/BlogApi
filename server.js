const express = require("express");
const app = express();
const User = require("./models/User.js");
const cors = require("cors");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const initializePassport = require("./config/passport-config.js");
const errorhandler = require("errorhandler");

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

// Passport middleware
app.use(passport.initialize());

// Routes
const usersRouter = require("./routes/users/users.js");
const blogsRouter = require("./routes/blogs/blogs.js");
app.use("/user", usersRouter);
app.use("/blog", blogsRouter);

// Error handling middleware
app.use(errorhandler());

// MongoDB connection
const dbUrl = process.env.DATABASEURL;
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", (error) => {
  console.error("Database connection error:", error);
  // Retry connecting to the database after 5 seconds
  setTimeout(() => {
    mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  }, 5000);
});
db.once("open", () => console.log("Connected to Mongoose"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
