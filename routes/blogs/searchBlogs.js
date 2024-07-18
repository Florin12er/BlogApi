const Blog = require('../../models/Blog');

async function searchBlogs(req, res) {
  try {
    const { query } = req.query;  // Get the search query from the request

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const blogs = await Blog.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(10);  // Limit to 10 results, adjust as needed

    if (blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found matching the search query" });
    }

    res.json(blogs);
  } catch (error) {
    console.error('Error searching blogs:', error);
    res.status(500).json({ message: "An error occurred while searching blogs" });
  }
}

module.exports = searchBlogs;

