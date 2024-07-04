const Blog = require("../../models/Blog");

async function Like(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (!blog.likes.includes(req.user.id)) {
      blog.likes.push(req.user.id);
      // Remove user from dislikes if they previously disliked the blog
      blog.dislikes.pull(req.user.id);
      await blog.save();
      res.status(200).json({ message: "Blog liked successfully" });
    } else {
      res.status(400).json({ message: "You have already liked this blog" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error liking blog", error });
  }
}
async function Unlike(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.likes.includes(req.user.id)) {
      blog.likes.pull(req.user.id);
      await blog.save();
      res.status(200).json({ message: "Blog unliked successfully" });
    } else {
      res.status(400).json({ message: "You have not liked this blog" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error unliking blog", error });
  }
}
async function LikeCount(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ likesCount: blog.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Error getting likes count", error });
  }
}
module.exports = { Like, Unlike, LikeCount };
