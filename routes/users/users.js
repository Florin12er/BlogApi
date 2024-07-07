const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const PostLogin = require("./login.js");
const { PostRegister } = require("./register.js");
const User = require("../../models/User.js");
const Blog = require("../../models/Blog.js");
const LogOut = require("./logout.js");
const { Reset, requestPasswordReset } = require("./reset.js");
const ShowAllUsers = require("./showAll.js");
const DeleteUser = require("./deleteUser.js");
const {
  checkNotAuthenticated,
  checkAuthenticated,
} = require("../../middleware/checks.js");
const GetUserByID = require("./getUserById.js");
const { Follow, Unfollow, Followers, Following } = require("./follow.js");
const { Like, Unlike, LikeCount } = require("./Likes.js");
const { Dislike, Undislike, DislikeCount } = require("./Dislikes.js");
const Settings = require("./Setting.js");
const passport = require("passport");
const Upload = require("./upload.js");
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Route to show all users (protected)
router.get("/", checkAuthenticated, ShowAllUsers);

// Register route (accessible only for unauthenticated users)
router.post("/register", checkNotAuthenticated, PostRegister);

// Login route (accessible only for unauthenticated users)
router.post("/login", checkNotAuthenticated, PostLogin);

const checkGuest = (req, res, next) => {
  if (req.user.isGuest) {
    return next();
  }
  res
    .status(403)
    .json({ message: "Access forbidden: guests cannot perform this action." });
};
router.post("/guest", async (req, res) => {
  try {
    // Create a new guest user
    const guestUser = new User({
      username: `guest_${Math.floor(Math.random() * 100000)}`,
      email: `guest_${Math.floor(Math.random() * 100000)}@example.com`,
      isGuest: true,
    });

    await guestUser.save();

    // Generate a JWT token for the guest user
    const token = jwt.sign({ userId: guestUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, userId: guestUser._id });
  } catch (error) {
    console.error("Error creating guest user:", error);
    res.status(500).json({ error: "Failed to create guest user" });
  }
});
// Logout route (protected or optional check)
router.delete("/logout", checkAuthenticated, LogOut);

// Delete user route (protected)
router.delete("/delete", checkAuthenticated, DeleteUser);

// Password reset routes (public)
router.post("/reset", Reset);
router.post("/request-reset", requestPasswordReset);

// Route to check if the user is authenticated (protected)
router.get("/auth/status", checkAuthenticated, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Upload profile picture route (protected)
router.post(
  "/upload",
  checkAuthenticated,
  upload.single("profilePicture"),
 Upload 
);

// Like a blog (protected)
router.post("/blog/:id/like", checkGuest,checkAuthenticated, Like);

// Unlike a blog (protected)
router.post("/blog/:id/unlike", checkGuest,checkAuthenticated, Unlike);

// Dislike a blog (protected)
router.post("/blog/:id/dislike", checkGuest,checkAuthenticated, Dislike);

// Undislike a blog (protected)
router.post("/blog/:id/undislike", checkGuest,checkAuthenticated, Undislike);

// Get likes count for a blog (protected)
router.get("/blog/:id/likes/count", checkAuthenticated, LikeCount);

// Get dislikes count for a blog (protected)
router.get("/blog/:id/dislikes/count", checkAuthenticated, DislikeCount);

// Get user by ID (protected)
router.get("/:id", checkAuthenticated, GetUserByID);

router.patch("/settings", checkAuthenticated, checkGuest,Settings);

module.exports = router;
