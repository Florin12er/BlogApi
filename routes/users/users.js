const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const User = require("../../models/User.js");
const Blog = require("../../models/Blog.js");
const { checkAuthenticated, checkNotAuthenticated } = require("../../middleware/checks.js");

// Middleware to differentiate guest and regular users
const checkGuest = (req, res, next) => {
  if (req.user.isGuest) {
    return next();
  }
  res.status(403).json({ message: "Access forbidden: guests cannot perform this action." });
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

// Route to show all users (guests allowed)
router.get("/", checkAuthenticated, ShowAllUsers);

// Register route (accessible only for unauthenticated users)
router.post("/register", checkNotAuthenticated, PostRegister);

// Login route (accessible only for unauthenticated users)
router.post("/login", checkNotAuthenticated, PostLogin);

// Logout route (protected or optional check)
router.delete("/logout", checkAuthenticated, LogOut);

// Delete user route (protected, not for guests)
router.delete("/delete", checkAuthenticated, checkGuest, DeleteUser);

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

// Upload profile picture route (protected, not for guests)
router.post(
  "/upload",
  checkAuthenticated,
  checkGuest,
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

// Like a blog (protected, guests allowed)
router.post("/blog/:id/like", checkAuthenticated, Like);

// Unlike a blog (protected, guests allowed)
router.post("/blog/:id/unlike", checkAuthenticated, Unlike);

// Dislike a blog (protected, guests allowed)
router.post("/blog/:id/dislike", checkAuthenticated, Dislike);

// Undislike a blog (protected, guests allowed)
router.post("/blog/:id/undislike", checkAuthenticated, Undislike);

// Get likes count for a blog (guests allowed)
router.get("/blog/:id/likes/count", checkAuthenticated, LikeCount);

// Get dislikes count for a blog (guests allowed)
router.get("/blog/:id/dislikes/count", checkAuthenticated, DislikeCount);

// Get user by ID (protected, guests allowed)
router.get("/:id", checkAuthenticated, GetUserByID);

// Update settings (protected, not for guests)
router.patch("/settings", checkAuthenticated, checkGuest, Settings);

module.exports = router;

