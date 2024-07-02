const Blog = require("../../models/Blog");

async function UpdateBlog(req, res) {
  try {
    const blogId = req.params.id;
    const username = req.user.username; // Assuming your User model has _id field
    const { title, links, tags, content } = req.body;

    // Find the blog by ID and author (to ensure the user owns the blog)
    let blog = await Blog.findOne({ _id: blogId, author: username });

    if (!blog) {
      return res
        .status(404)
        .json({
          error: "Blog not found or you are not authorized to update it",
        });
    }

    // Update blog fields
    blog.title = title;
    blog.links = links;
    blog.tags = tags;
    blog.content = content;

    // Save updated blog
    await blog.save();

    res.json({ message: "Blog updated successfully", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
module.exports = UpdateBlog
