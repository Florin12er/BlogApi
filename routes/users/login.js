const passport = require("passport");
const User = require("../../models/User"); // Adjust path as necessary
const jwt = require("jsonwebtoken");

function PostLogin(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error(err); // Log the error to the console
      return res
        .status(500)
        .json({ error: "Authentication failed", details: err.message });
    }
    if (!user) {
      return res
        .status(401)
        .json({ error: info.message || "Authentication failed" });
    }

    // Sign JWT token with user information
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res
      .status(200)
      .json({ message: "Logged in successfully", token });
  })(req, res, next);
}

module.exports = PostLogin;

