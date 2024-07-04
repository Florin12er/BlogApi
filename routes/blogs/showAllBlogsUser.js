const Blog = require("../../models/Blog");
const jwt = require("jsonwebtoken");

async function ShowAllUserBlogs(req, res) {
  try {
    // Extract token from authorization header
    const token = req.headers.authorization.split(" ")[1];
    
    // Verify the token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

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

