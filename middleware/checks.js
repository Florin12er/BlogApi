const dotenv = require("dotenv");
dotenv.config();
const Blog = require("../models/Blog");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function checkAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      try {
        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        req.user = user;
        next();
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
      }
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
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(401).json({ message: "API key missing" });
  }

  try {
    // Find all users (this is not efficient for large datasets)
    const users = await User.find({});
    
    // Find the user whose decrypted API key matches the provided key
    const user = users.find(u => {
      if (!u.apiKey) {
        return false;
      }
      const decryptedApiKey = u.decryptText(u.apiKey);
      if (decryptedApiKey === null) {
        console.log(`Failed to decrypt API key for user ${u._id}`);
        return false;
      }
      return decryptedApiKey === apiKey;
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid API key" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error authenticating API key:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware to check if the user is a guest
const checkGuest = (req, res, next) => {
  if (req.user.isGuest) {
    return res.status(403).json({ message: "Access forbidden: guests cannot perform this action." });
  }
  next();
};


module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
  authenticateApiKey,
  checkGuest,
};
