const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const PostLogin = require("./login.js");
const { PostRegister } = require("./register.js");
const User = require("../../models/User.js");
const LogOut = require("./logout.js");
const { Reset, requestPasswordReset } = require("./reset.js");
const ShowAllUsers = require("./showAll.js");
const DeleteUser = require("./deleteUser.js");
const {
  checkNotAuthenticated,
  checkAuthenticated,
} = require("../../middleware/checks.js");
const GetUserByID = require("./getUserById.js");

// Route to show all users (protected)
router.get("/", checkAuthenticated, ShowAllUsers);

// Register route (accessible only for unauthenticated users)
router.post("/register", checkNotAuthenticated, PostRegister);

// Login route (accessible only for unauthenticated users)
router.post("/login", checkNotAuthenticated, PostLogin);

// Logout route (protected or optional check)
router.delete("/logout", checkAuthenticated, LogOut);

// Delete user route (protected)
router.delete("/delete", checkAuthenticated, DeleteUser);

// Password reset routes (public)
router.post("/reset", Reset);
router.post("/request-reset", requestPasswordReset);

// Route to check if the user is authenticated (protected)
router.get("/auth/status", checkAuthenticated, (req, res) => {
  res.status(200).json({ authenticated: true, user: req.user });
});

// Google authentication routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ sub: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  },
);

// GitHub authentication routes
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

router.get(
  "/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ sub: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  },
);

// Get user by ID (protected)
router.get("/user/:id", checkAuthenticated, GetUserByID);

module.exports = router;
