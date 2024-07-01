const passport = require("passport");
const User = require("../../models/User"); // Adjust path as necessary

function PostLogin(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "An error occurred during authentication" });
    }
    if (!user) {
      return res
        .status(401)
        .json({ error: info.message || "Authentication failed" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log in user" });
      }
      return res.status(200).json({ message: "Logged in successfully", user });
    });
  })(req, res, next);
}

module.exports = PostLogin;
