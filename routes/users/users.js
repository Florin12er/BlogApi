const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require('jsonwebtoken'); // Add this line
const PostLogin = require("./login.js");
const { PostRegister } = require("./register.js");
const User = require("../../models/User.js");
const LogOut = require("./logout.js");
const { Reset, requestPasswordReset } = require("./reset.js");
const ShowAllUsers = require("./showAll.js");
const DeleteUser = require("./deleteUser.js");

const authenticateJWT = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).send({ error: "Missing authorization header" });
  }
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).send({ error: "Invalid token" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).send({ error: "Invalid token" });
    req.user = user;
    next();
  });
};
router.get("/", authenticateJWT, ShowAllUsers);
router.post("/register", PostRegister); // Remove authenticateJWT middleware
router.post("/login", PostLogin);
router.delete("/logout", LogOut);
router.delete("/delete", authenticateJWT, DeleteUser);
router.post("/reset", Reset);
router.post("/request-reset", requestPasswordReset);

// Route to check if the user is authenticated
router.get("/auth/status", authenticateJWT, (req, res) => {
  res.status(200).json({ authenticated: true, user: req.user });
});

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
module.exports = router;
