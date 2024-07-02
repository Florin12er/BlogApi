const express = require("express");
const router = express.Router();
const passport = require("passport");
const { checkNotAuthenticated, checkAuthenticated } = require("../../middleware/checks.js");
const PostLogin = require("./login.js"); 
const { PostRegister } = require("./register.js");
const User = require("../../models/User.js");
const LogOut = require("./logout.js");
const { Reset, requestPasswordReset } = require("./reset.js");
const ShowAllUsers = require("./showAll.js");
const DeleteUser = require("./deleteUser.js");

router.get("/", checkAuthenticated, ShowAllUsers);
router.post("/register", checkNotAuthenticated, PostRegister);
router.post("/login", checkNotAuthenticated, PostLogin);
router.delete("/logout", LogOut);
router.delete("/delete", checkAuthenticated, DeleteUser);
router.post("/reset", Reset);
router.post("/request-reset", requestPasswordReset);

// Route to check if the user is authenticated
router.get("/auth/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ authenticated: true, user: req.user });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard"); 
  },
);

router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard"); 
  },
);

module.exports = router;

