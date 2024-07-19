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

    // Define sort options based on user input
    let sortOptions = {};
    if (sortBy === 'relevance') {
      // Note: Relevance sorting is not applicable here since we're not using text search
      // You can implement a custom scoring mechanism if needed
      sortOptions = { createdAt: sortOrder === 'asc' ? 1 : -1 }; // Fallback to date sorting
    } else if (sortBy === 'date') {
      sortOptions = { createdAt: sortOrder === 'asc' ? 1 : -1 };
    }

    // Construct the search query
    const searchQuery = {
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex }
      ]
    };

    // Execute the search
    const blogs = await Blog.find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Count the total number of documents matching the search query
    const total = await Blog.countDocuments(searchQuery);

    // Send the response
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

