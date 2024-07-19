const express = require("express");
const router = express.Router();

// Middleware for checking authentication
const {
  checkAuthenticated,
  checkGuest,
  authenticateApiKey,
} = require("../../middleware/checks");
const AddBlog = require("./addBlog");
const ShowAllBlogs = require("./showAllBlogs");
const ShowAllUserBlogs = require("./showAllBlogsUser");
const DeleteBlog = require("./deleteBlog");
const UpdateBlog = require("./updateBlog");
const GetUserBlogById = require("./getBlogById");
const User = require("../../models/User");
const {
  PostComment,
  UpdateComment,
  DeleteComment,
  ShowAllComments,
} = require("./comments");
const searchBlogs = require("./searchBlogs");
const uploadThumbnail = require("../users/thumbnail");

// Search route should be placed before other routes that use path parameters
router.get(
  "/search",
  authenticateApiKey,
  checkAuthenticated,
  async (req, res) => {
    await searchBlogs(req, res);
  },
);

// GET all blogs route
router.get("/", authenticateApiKey, checkAuthenticated, ShowAllBlogs);

router.post(
  "/upload-thumbnail",
  authenticateApiKey,
  checkAuthenticated,
  uploadThumbnail,
);

// GET all blogs by user route
router.get(
  "/user/:id",
  authenticateApiKey,
  checkAuthenticated,
  ShowAllUserBlogs,
);

// POST new blog route
router.post("/new", authenticateApiKey, checkAuthenticated, AddBlog);

// GET blog by ID route
router.get("/:id", authenticateApiKey, checkAuthenticated, GetUserBlogById);

// DELETE blog route
router.delete("/:id", authenticateApiKey, checkAuthenticated, DeleteBlog);

// PUT update blog route
router.put("/:id", authenticateApiKey, checkAuthenticated, UpdateBlog);

// POST a new comment to a blog
router.post(
  "/:id/comment",
  authenticateApiKey,
  checkGuest,
  checkAuthenticated,
  PostComment,
);

// PUT update a comment on a blog
router.put(
  "/:blogId/comment/:commentId",
  authenticateApiKey,
  checkGuest,
  checkAuthenticated,
  UpdateComment,
);

// DELETE a comment from a blog
router.delete(
  "/:blogId/comment/:commentId",
  authenticateApiKey,
  checkGuest,
  checkAuthenticated,
  DeleteComment,
);

// GET all comments for a blog
router.get(
  "/:id/comments",
  checkGuest,
  authenticateApiKey,
  checkAuthenticated,
  ShowAllComments,
);

module.exports = router;
