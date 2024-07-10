const dotenv = require("dotenv");
dotenv.config();
const Blog = require("../models/Blog");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const checkAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user; // Set req.user with the user object
    next();
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};


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
async function checkCommentOwnership(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the authenticated user is the owner of the comment
    if (!req.user || req.user.username !== comment.user.username) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }

    next(); // Proceed to the next middleware or controller if authorized
  } catch (error) {
    console.error("Error in checkCommentOwnership:", error);
    res
      .status(500)
      .json({ message: "Error checking comment ownership", error });
  }
}

const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'API key missing' });
  }

  try {
    const user = req.user;

    if (!user || typeof user.decryptText !== 'function') {
      return res.status(401).json({ message: 'Invalid user or decryptText method not available' });
    }

    const decryptedApiKey = user.decryptText(user.apiKey);
    if (apiKey !== decryptedApiKey) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    req.decryptedApiKey = decryptedApiKey; // Optionally store decrypted API key
    next();
  } catch (error) {
    console.error('Error authenticating API key:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to check if the user is a guest
const checkGuest = (req, res, next) => {
  if (req.user.isGuest) {
    return next();
  }
  res
    .status(403)
    .json({ message: "Access forbidden: guests cannot perform this action." });
};

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
  checkCommentOwnership,
  authenticateApiKey,
  checkGuest,
};
