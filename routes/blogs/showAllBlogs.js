const Blog = require("../../models/Blog");

async function ShowAllBlogs(req, res) {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ message: err.message });
  }
}


module.exports = ShowAllBlogs;
