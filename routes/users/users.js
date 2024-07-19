const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const PostLogin = require("./login.js");
const { PostRegister } = require("./register.js");
const LogOut = require("./logout.js");
const { Reset, requestPasswordReset } = require("./reset.js");
const ShowAllUsers = require("./showAll.js");
const DeleteUser = require("./deleteUser.js");
const {
  checkNotAuthenticated,
  checkAuthenticated,
  authenticateApiKey,
  checkGuest,
} = require("../../middleware/checks.js");

const GetUserByID = require("./getUserById.js");
const { Like, Unlike, LikeCount } = require("./Likes.js");
const { Dislike, Undislike, DislikeCount } = require("./Dislikes.js");
const Settings = require("./Setting.js");
const Upload = require("./upload.js");
const Guest = require("./Guest.js");
const { GetApiKey, GenerateApiKey } = require("../apiKey/ApiKey.js");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../../public/uploads"));
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

// Route to create a guest user
router.post("/guest", checkNotAuthenticated, Guest);

// Logout route (protected or optional check)
router.delete("/logout", checkAuthenticated, LogOut);

// Delete user route (protected)
router.delete("/delete", authenticateApiKey, checkAuthenticated, DeleteUser);

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
  authenticateApiKey,
  checkAuthenticated,
  upload.single("profilePicture"),
  Upload,
);

// Blog like/unlike routes (protected)
router.post(
  "/blog/:id/like",
  authenticateApiKey,
  checkGuest,
  checkAuthenticated,
  Like,
);
router.post(
  "/blog/:id/unlike",
  authenticateApiKey,
  checkGuest,
  checkAuthenticated,
  Unlike,
);
router.post(
  "/blog/:id/dislike",
  authenticateApiKey,
  checkGuest,
  checkAuthenticated,
  Dislike,
);
router.post(
  "/blog/:id/undislike",
  authenticateApiKey,
  checkGuest,
  checkAuthenticated,
  Undislike,
);

// Blog likes/dislikes count routes (protected)
router.get(
  "/blog/:id/likes/count",
  authenticateApiKey,
  checkAuthenticated,
  LikeCount,
);
router.get(
  "/blog/:id/dislikes/count",
  authenticateApiKey,
  checkAuthenticated,
  DislikeCount,
);

// Get user by ID (protected)
router.get("/:id", checkAuthenticated, GetUserByID);

// User settings route (protected)
router.patch(
  "/settings",
  authenticateApiKey,
  checkAuthenticated,
  checkGuest,
  Settings,
);
// get the api key
router.get("/get-api-key", checkAuthenticated, GetApiKey);
// Generate API key route (protected)
router.post("/generate-api-key", checkAuthenticated, GenerateApiKey);

module.exports = router;
