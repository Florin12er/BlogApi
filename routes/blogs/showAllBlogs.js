const Blog = require("../../models/Blog");

async function ShowAllBlogs(req, res) {
  try {
    // Get page and limit from query parameters, set defaults if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Get total count of blogs
    const total = await Blog.countDocuments();

    // Find blogs with pagination
    const blogs = await Blog.find()
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .skip(skip)
      .limit(limit);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Send response
    res.json({
      blogs,
      currentPage: page,
      totalPages,
      totalBlogs: total
    });
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ message: "An error occurred while fetching blogs" });
  }
}

module.exports = ShowAllBlogs;

