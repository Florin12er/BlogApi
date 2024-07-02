const Blog = require("../../models/Blog");

async function deleteBlog(req, res) {
  const blogId = req.params.id;
  const username = req.user.username; // Assuming your User model has _id field

  try {
    // Find the blog by ID and author (to ensure the user owns the blog)
    const blog = await Blog.findOne({ _id: blogId, author: username });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found or you are not authorized to delete it" });
    }

    // Remove the blog
    await blog.deleteOne();

    return res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = deleteBlog;

