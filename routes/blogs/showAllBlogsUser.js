const Blog = require("../../models/Blog");

async function ShowAllUserBlogs(req, res) {
  try {
    // Assuming req.user contains the authenticated user object with _id
    const userId = req.user._id;

    // Fetch blogs authored by the user
    const blogs = await Blog.find({ author: userId });

    // Respond with the blogs
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    res.status(500).json({ error: "Failed to fetch user blogs" });
  }
}

module.exports = ShowAllUserBlogs;

