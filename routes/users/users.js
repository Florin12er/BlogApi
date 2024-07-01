// router.js
const express = require("express");
const router = express.Router();
const PostLogin = require("./login.js"); // Assuming this file exists and exports something
const { PostRegister } = require("./register.js");
const LogOut = require("./logout.js");
const Reset = require("./reset.js");
const ShowAllUsers = require("./showAll.js");

const {
  checkNotAuthenticated,
  checkAuthenticated,
} = require("../../middleware/checks.js");

router.get("/", ShowAllUsers);
router.post("/register", checkNotAuthenticated, PostRegister);
router.post("/login", checkNotAuthenticated, PostLogin);
router.delete("/logout", LogOut);
router.post("/reset", Reset);

module.exports = router;
