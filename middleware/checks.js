const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

function checkAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      req.user = decoded;
      next();
    });
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

function checkNotAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.status(403).json({ error: "Already authenticated" });
    } catch (err) {
      // Ignore the error and continue to the next middleware
    }
  }
  next();
}

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
};

