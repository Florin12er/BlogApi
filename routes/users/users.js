const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

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
  authenticateApiKey,
  checkGuest,
} = require("../../middleware/checks.js");
const GetUserByID = require("./getUserById.js");
const { Follow, Unfollow, Followers, Following } = require("./follow.js");
const { Like, Unlike, LikeCount } = require("./Likes.js");
const { Dislike, Undislike, DislikeCount } = require("./Dislikes.js");
const Settings = require("./Setting.js");
const passport = require("passport");
const Upload = require("./upload.js");
const apiKeyLimiter = require("../../middleware/rateLimit.js");

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

// Utility function to generate an API key
const generateApiKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Route to show all users (protected)
router.get("/", checkAuthenticated, ShowAllUsers);

// Register route (accessible only for unauthenticated users)
router.post("/register", checkNotAuthenticated, PostRegister);

// Login route (accessible only for unauthenticated users)
router.post("/login", PostLogin);

// Route to create a guest user
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

router.get("/get-api-key", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const decryptedApiKey = user.decryptText(user.apiKey); // Decrypt API key
    res.status(200).json({ apiKey: decryptedApiKey }); // Respond with decrypted API key
  } catch (error) {
    console.error("Error retrieving API key:", error);
    res.status(500).json({ error: "Failed to retrieve API key" });
  }
});
// Generate API key route (protected)
router.post("/generate-api-key", checkAuthenticated, async (req, res) => {
  try {
    const apiKey = generateApiKey();
    const encryptedApiKey = req.user.encryptText(apiKey); // Encrypt the API key
    console.log("Encrypted API Key:", encryptedApiKey); // Add logging
    req.user.apiKey = encryptedApiKey;
    await req.user.save();
    res.status(200).json({ apiKey });
  } catch (error) {
    console.error("Error generating API key:", error);
    res.status(500).json({ error: "Failed to generate API key" });
  }
});

module.exports = router;
