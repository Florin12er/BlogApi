// router.js
const express = require("express");
const router = express.Router();
const PostLogin = require("./login.js"); // Assuming this file exists and exports something
const { PostRegister } = require("./register.js");
const User = require("../../models/User.js");
const LogOut = require("./logout.js");
const { Reset, requestPasswordReset } = require("./reset.js");
const ShowAllUsers = require("./showAll.js");
const passport = require("passport");
const DeleteUser = require("./deleteUser.js");

const {
  checkNotAuthenticated,
  checkAuthenticated,
} = require("../../middleware/checks.js");

router.get("/", ShowAllUsers);
router.post("/register", checkNotAuthenticated, PostRegister);
router.post("/login", checkNotAuthenticated, PostLogin);
router.delete("/logout", LogOut);
router.delete("/delete", checkAuthenticated, DeleteUser);
router.post("/reset", Reset);
router.post("/request-reset", requestPasswordReset);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Google callback route
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard"); // Redirect to dashboard or desired route
  },
);

// Login with GitHub
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

// GitHub callback route
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard"); // Redirect to dashboard or desired route
  },
);

module.exports = router;
