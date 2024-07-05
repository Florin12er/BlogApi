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

// Guest login route
router.post("/guest", async (req, res) => {
  try {
    const guestId = uuidv4();
    const guestUser = new User({
      username: `guest_${guestId}`,
      email: `guest_${guestId}@example.com`,
      isGuest: true,
    });

    await guestUser.save();

    const token = jwt.sign({ sub: guestUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, user: guestUser });
  } catch (error) {
    res.status(500).json({ message: "Error creating guest user", error });
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

// Google authentication routes
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

// GitHub authentication routes
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

// Upload profile picture route (protected)
router.post(
  "/upload",
  checkAuthenticated,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.profilePicture = `/uploads/${req.file.filename}`;
      await user.save();

      res.status(200).json({
        message: "Profile picture uploaded successfully",
        filePath: user.profilePicture,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error uploading profile picture", error });
    }
  },
);

// Like a blog (protected)
router.post("/blog/:id/like", checkAuthenticated, Like);

// Unlike a blog (protected)
router.post("/blog/:id/unlike", checkAuthenticated, Unlike);

// Dislike a blog (protected)
router.post("/blog/:id/dislike", checkAuthenticated, Dislike);

// Undislike a blog (protected)
router.post("/blog/:id/undislike", checkAuthenticated, Undislike);

// Get likes count for a blog (protected)
router.get("/blog/:id/likes/count", checkAuthenticated, LikeCount);

// Get dislikes count for a blog (protected)
router.get("/blog/:id/dislikes/count", checkAuthenticated, DislikeCount);

// Get user by ID (protected)
router.get("/:id", checkAuthenticated, GetUserByID);

router.patch("/settings", checkAuthenticated, Settings);

module.exports = router;
