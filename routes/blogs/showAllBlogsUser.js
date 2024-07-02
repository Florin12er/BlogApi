const Blog = require("../../models/Blog");

async function ShowAllUserBlogs(req, res) {
  try {
    const username = req.user.username; // Assuming your User model has _id field

    // Find all blogs where author matches the authenticated user's ID
    const blogs = await Blog.find({ author: username });

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
module.exports = ShowAllUserBlogs
