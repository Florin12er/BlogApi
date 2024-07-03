const express = require("express");
const router = express.Router();
const passport = require("passport");
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
const { checkNotAuthenticated, checkAuthenticated } = require("../../middleware/checks.js");
const GetUserByID = require("./getUserById.js");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
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
router.post("/upload", checkAuthenticated, upload.single("profilePicture"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({ message: "Profile picture uploaded successfully", filePath: user.profilePicture });
  } catch (error) {
    res.status(500).json({ message: "Error uploading profile picture", error });
  }
});

// Follow a user (protected)
router.post("/follow/:id", checkAuthenticated, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser.following.includes(userToFollow._id)) {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
      
      await currentUser.save();
      await userToFollow.save();

      res.status(200).json({ message: "User followed successfully" });
    } else {
      res.status(400).json({ message: "You are already following this user" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error following user", error });
  }
});

// Unfollow a user (protected)
router.post("/unfollow/:id", checkAuthenticated, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(req.user.id);
    const followingIndex = currentUser.following.indexOf(userToUnfollow._id);
    const followersIndex = userToUnfollow.followers.indexOf(currentUser._id);

    if (followingIndex > -1) {
      currentUser.following.splice(followingIndex, 1);
      userToUnfollow.followers.splice(followersIndex, 1);

      await currentUser.save();
      await userToUnfollow.save();

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      res.status(400).json({ message: "You are not following this user" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error unfollowing user", error });
  }
});

// Get followers count (protected)
router.get("/followers/count", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('followers', 'username email');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ followersCount: user.followers.length });
  } catch (error) {
    res.status(500).json({ message: "Error getting followers count", error });
  }
});

// Get following count (protected)
router.get("/following/count", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('following', 'username email');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ followingCount: user.following.length });
  } catch (error) {
    res.status(500).json({ message: "Error getting following count", error });
  }
});

// Like a blog (protected)
router.post("/blog/:id/like", checkAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (!blog.likes.includes(req.user.id)) {
      blog.likes.push(req.user.id);
      // Remove user from dislikes if they previously disliked the blog
      blog.dislikes.pull(req.user.id);
      await blog.save();
      res.status(200).json({ message: "Blog liked successfully" });
    } else {
      res.status(400).json({ message: "You have already liked this blog" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error liking blog", error });
  }
});

// Unlike a blog (protected)
router.post("/blog/:id/unlike", checkAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.likes.includes(req.user.id)) {
      blog.likes.pull(req.user.id);
      await blog.save();
      res.status(200).json({ message: "Blog unliked successfully" });
    } else {
      res.status(400).json({ message: "You have not liked this blog" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error unliking blog", error });
  }
});

// Dislike a blog (protected)
router.post("/blog/:id/dislike", checkAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (!blog.dislikes.includes(req.user.id)) {
      blog.dislikes.push(req.user.id);
      // Remove user from likes if they previously liked the blog
      blog.likes.pull(req.user.id);
      await blog.save();
      res.status(200).json({ message: "Blog disliked successfully" });
    } else {
      res.status(400).json({ message: "You have already disliked this blog" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error disliking blog", error });
  }
});

// Undislike a blog (protected)
router.post("/blog/:id/undislike", checkAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.dislikes.includes(req.user.id)) {
      blog.dislikes.pull(req.user.id);
      await blog.save();
      res.status(200).json({ message: "Blog undisliked successfully" });
    } else {
      res.status(400).json({ message: "You have not disliked this blog" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error undisliking blog", error });
  }
});

// Get likes count for a blog (protected)
router.get("/blog/:id/likes/count", checkAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ likesCount: blog.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Error getting likes count", error });
  }
});

// Get dislikes count for a blog (protected)
router.get("/blog/:id/dislikes/count", checkAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ dislikesCount: blog.dislikes.length });
  } catch (error) {
    res.status(500).json({ message: "Error getting dislikes count", error });
  }
});

// Get user by ID (protected)
router.get("/:id", checkAuthenticated, GetUserByID);

module.exports = router;

