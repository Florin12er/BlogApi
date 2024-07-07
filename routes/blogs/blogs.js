const express = require("express");
const router = express.Router();
const Blog = require("../../models/Blog");

// Middleware for checking authentication
const { checkAuthenticated, checkCommentOwnership } = require("../../middleware/checks");
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

// GET all blogs route
router.get("/", checkAuthenticated, ShowAllBlogs);

router.get("/:id", checkAuthenticated, GetUserBlogById);
// GET all blogs by user route
router.get("/user/:id", checkAuthenticated, ShowAllUserBlogs);

// POST new blog route
router.post("/new", checkAuthenticated, AddBlog);

// DELETE blog route
router.delete("/:id", checkAuthenticated, DeleteBlog);

// PUT update blog route
router.put("/:id", checkAuthenticated, UpdateBlog);
// POST a new comment to a blog
router.post("/:id/comment", checkAuthenticated, PostComment);
// PUT update a comment on a blog
router.put("/:blogId/comment/:commentId",checkCommentOwnership, checkAuthenticated, UpdateComment);
// DELETE a comment from a blog
router.delete("/:blogId/comment/:commentId",checkCommentOwnership, checkAuthenticated, DeleteComment);
// GET all comments for a blog
router.get("/:id/comments", checkAuthenticated, ShowAllComments);

module.exports = router;
