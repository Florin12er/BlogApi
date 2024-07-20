const Blog = require("../../models/Blog");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads/thumbnails')); // Change this path as needed
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

async function UpdateBlog(req, res) {
  try {
    const blogId = req.params.id;
    const username = req.user.username; // Assuming your User model has _id field
    const { title, links, tags, content } = req.body;

    // Find the blog by ID and author (to ensure the user owns the blog)
    let blog = await Blog.findOne({ _id: blogId, author: username });

    if (!blog) {
      return res.status(404).json({
        error: "Blog not found or you are not authorized to update it",
      });
    }

    // Update blog fields
    blog.title = title;
    blog.links = links;
    blog.tags = tags;
    blog.content = content;

    // Check if a new thumbnail is uploaded
    if (req.file) {
      blog.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }

    // Save updated blog
    await blog.save();

    res.json({ message: "Blog updated successfully", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { UpdateBlog, upload };

