const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Import route handlers
const PostLogin = require("./login.js");
const { PostRegister } = require("./register.js");
const LogOut = require("./logout.js");
const { Reset, requestPasswordReset } = require("./reset.js");
const ShowAllUsers = require("./showAll.js");
const DeleteUser = require("./deleteUser.js");
const GetUserByID = require("./getUserById.js");
const { Like, Unlike, LikeCount } = require("./Likes.js");
const { Dislike, Undislike, DislikeCount } = require("./Dislikes.js");
const Settings = require("./Setting.js");
const Upload = require("./upload.js");
const Guest = require("./Guest.js");
const { GetApiKey, GenerateApiKey } = require("../apiKey/ApiKey.js");

// Import middleware
const {
  checkNotAuthenticated,
  checkAuthenticated,
  authenticateApiKey,
  checkGuest,
} = require("../../middleware/checks.js");

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

// Public routes
router.post("/register", checkNotAuthenticated, PostRegister);
router.post("/login", checkNotAuthenticated, PostLogin);
router.post("/guest", checkNotAuthenticated, Guest);
router.post("/reset", Reset);
router.post("/request-reset", requestPasswordReset);

// Authentication routes
router.delete("/logout", checkAuthenticated, LogOut);
router.get("/auth/status", checkAuthenticated, (req, res) => {
  res.status(200).json({ user: req.user });
});

// User management routes
router.get("/", checkAuthenticated, ShowAllUsers);
router.get("/:id", checkAuthenticated, GetUserByID);
router.delete("/delete", authenticateApiKey, checkAuthenticated, DeleteUser);
router.patch("/settings", authenticateApiKey, checkAuthenticated, checkGuest, Settings);
router.post("/upload", authenticateApiKey, checkAuthenticated, upload.single("profilePicture"), Upload);

// API key routes
router.get("/get-api-key", checkAuthenticated, GetApiKey);
router.post("/generate-api-key", checkAuthenticated, GenerateApiKey);

// Blog interaction routes
const blogInteractionRoutes = express.Router();
blogInteractionRoutes.use(authenticateApiKey, checkGuest, checkAuthenticated);

blogInteractionRoutes.post("/:id/like", Like);
blogInteractionRoutes.post("/:id/unlike", Unlike);
blogInteractionRoutes.post("/:id/dislike", Dislike);
blogInteractionRoutes.post("/:id/undislike", Undislike);
blogInteractionRoutes.get("/:id/likes/count", LikeCount);
blogInteractionRoutes.get("/:id/dislikes/count", DislikeCount);

router.use("/blog", blogInteractionRoutes);

module.exports = router;

