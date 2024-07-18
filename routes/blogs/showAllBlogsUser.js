const Blog = require("../../models/Blog");

async function ShowAllUserBlogs(req, res) {
  try {
    const username = req.user.username; // Get the username from the authenticated user

    // Optional: Implement pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find all blogs where author matches the authenticated user's username
    const blogs = await Blog.find({ author: username })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    // Get total count for pagination
    const total = await Blog.countDocuments({ author: username });

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (err) {
    console.error('Error in ShowAllUserBlogs:', err);
    res.status(500).json({ message: 'An error occurred while fetching blogs' });
  }
}

module.exports = ShowAllUserBlogs;

