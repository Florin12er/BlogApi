const express = require("express");
const router = express.Router();
const Blog = require("../../models/Blog");

// Middleware for checking authentication
const { checkAuthenticated, checkGuest, authenticateApiKey } = require("../../middleware/checks");
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

// GET all blogs route
router.get("/", authenticateApiKey,checkAuthenticated, ShowAllBlogs);

router.get("/:id", authenticateApiKey,checkAuthenticated, GetUserBlogById);
// GET all blogs by user route
router.get("/user/:id", authenticateApiKey,checkAuthenticated, ShowAllUserBlogs);

// POST new blog route
router.post("/new", authenticateApiKey,checkAuthenticated, AddBlog);

// DELETE blog route
router.delete("/:id",authenticateApiKey, checkAuthenticated, DeleteBlog);

// PUT update blog route
router.put("/:id", authenticateApiKey,checkAuthenticated, UpdateBlog);
// POST a new comment to a blog
router.post("/:id/comment",authenticateApiKey, checkGuest,checkAuthenticated, PostComment);
// PUT update a comment on a blog
router.put("/:blogId/comment/:commentId", authenticateApiKey,checkGuest,checkAuthenticated, UpdateComment);
// DELETE a comment from a blog
router.delete("/:blogId/comment/:commentId",authenticateApiKey,checkGuest, checkAuthenticated, DeleteComment);
// GET all comments for a blog
router.get("/:id/comments",checkGuest,authenticateApiKey, checkAuthenticated, ShowAllComments);

router.get("/search", checkAuthenticated, searchBlogs)

module.exports = router;
