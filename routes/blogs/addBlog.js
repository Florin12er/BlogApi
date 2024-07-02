;const Blog = require("../../models/Blog");
const { checkAuthenticated } = require("../../middleware/checks");

async function AddBlog(req, res) {
  try {
    const { title, links, tags, content } = req.body;
    if (!title || !links || !tags || !content) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    // Assuming req.user contains the authenticated user's information including username
    const { username } = req.user;

    const blog = new Blog({
      author: username, // Set author as username
      title,
      links,
      tags,
      content,
    });

    const result = await blog.save();

    res.status(201).json({ message: "Blog added successfully", blog: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = AddBlog;

