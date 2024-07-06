const express = require("express");
const router = express.Router();
const Blog = require("../../models/Blog");

// Middleware for checking authentication
const { checkAuthenticated } = require("../../middleware/checks");
const AddBlog = require("./addBlog");
const ShowAllBlogs = require("./showAllBlogs");
const ShowAllUserBlogs = require("./showAllBlogsUser");
const DeleteBlog = require("./deleteBlog");
const UpdateBlog = require("./updateBlog");
const GetUserBlogById = require("./getBlogById");
const User = require("../../models/User");

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
router.post("/:id/comment", checkAuthenticated, async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id; // Assuming req.user is set by the authentication middleware

  try {
    console.log(userId);
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const newComment = {
      user: userId,
      content,
    };

    blog.comments.push(newComment);
    await blog.save();

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error });
  }
});

// PUT update a comment on a blog
router.put("/:blogId/comment/:commentId", checkAuthenticated, async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;

  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Ensure the user updating the comment is the author
    if (!comment.user.equals(userId)) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    comment.content = content;
    await blog.save();

    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (error) {
    res.status(500).json({ message: "Error updating comment", error });
  }
});

// DELETE a comment from a blog
router.delete("/:blogId/comment/:commentId", checkAuthenticated, async (req, res) => {
  const userId = req.user._id;

  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Ensure the user deleting the comment is the author
    if (!comment.user.equals(userId)) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    comment.deleteOne();
    await blog.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error });
  }
});

// GET all comments for a blog
router.get("/:id/comments", checkAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("comments.user", "username");
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog.comments);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving comments", error });
  }
});

module.exports = router;
