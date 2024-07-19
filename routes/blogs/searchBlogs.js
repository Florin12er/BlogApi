// searchBlogs.js
const Blog = require('../../models/Blog');

async function searchBlogs(req, res) {
  try {
    const { query, page = 1, limit = 10, sortBy = 'relevance', sortOrder = 'desc' } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, 'i');

    let sortOptions = {};
    if (sortBy === 'relevance') {
      sortOptions = { score: { $meta: "textScore" } };
    } else if (sortBy === 'date') {
      sortOptions = { createdAt: sortOrder === 'asc' ? 1 : -1 };
    }

    const searchQuery = {
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex }
      ]
    };

    const blogs = await Blog.find(searchQuery)
      .select({ score: { $meta: "textScore" } })
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Blog.countDocuments(searchQuery);

    res.json({
      blogs,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (error) {
    console.error('Error searching blogs:', error);
    res.status(500).json({ message: "An error occurred while searching blogs" });
  }
}

module.exports = searchBlogs;

