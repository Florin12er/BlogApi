// uploadThumbnail.js
const Blog = require("../../models/Blog");
const path = require("path");

const multer = require("multer");

// Configure multer for thumbnail uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads/thumbnails"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage }).single("thumbnail");

const uploadThumbnail = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Error uploading thumbnail", error: err });
    }

    try {
      const { blogId } = req.body; // Assuming you pass the blog ID in the request body
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      // Update the blog with the new thumbnail path
      blog.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
      await blog.save();

      res.status(200).json({
        message: "Thumbnail uploaded successfully",
        thumbnailPath: blog.thumbnail,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating blog with thumbnail", error });
    }
  });
};

module.exports = uploadThumbnail;

