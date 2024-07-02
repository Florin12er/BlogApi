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

// GET all blogs route
router.get("/", checkAuthenticated, ShowAllBlogs);

// GET all blogs by user route
router.get("/user", checkAuthenticated, ShowAllUserBlogs);

// POST new blog route
router.post("/new", checkAuthenticated, AddBlog);

// DELETE blog route
router.delete("/:id", checkAuthenticated, DeleteBlog);

// PUT update blog route
router.put("/:id", checkAuthenticated, UpdateBlog);

module.exports = router;
