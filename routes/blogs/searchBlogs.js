const Blog = require("../../models/Blog");

async function searchBlogs(req, res) {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } },
    )
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(Number(limit));

    const total = await Blog.countDocuments({ $text: { $search: query } });

    res.json({
      blogs,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalBlogs: total,
    });
  } catch (error) {
    console.error("Error searching blogs:", error);
    res
      .status(500)
      .json({ message: "An error occurred while searching blogs" });
  }
}
module.exports = searchBlogs;
