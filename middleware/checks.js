const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Blog = require("../models/Blog");

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

    // Log user and comment details for debugging
    console.log("Authenticated user:", req.user);
    console.log("Comment user:", comment.user);

    // Check if the authenticated user is the owner of the comment
    if (!req.user || !req.user._id || comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to perform this action" });
    }

    next(); // Proceed to the next middleware or controller if authorized
  } catch (error) {
    console.error("Error in checkCommentOwnership:", error);
    res.status(500).json({ message: "Error checking comment ownership", error });
  }
}

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
  checkCommentOwnership,
};
