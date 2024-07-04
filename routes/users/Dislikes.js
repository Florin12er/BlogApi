const Blog = require("../../models/Blog");

async function Dislike(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (!blog.dislikes.includes(req.user.id)) {
      blog.dislikes.push(req.user.id);
      // Remove user from likes if they previously liked the blog
      blog.likes.pull(req.user.id);
      await blog.save();
      res.status(200).json({ message: "Blog disliked successfully" });
    } else {
      res.status(400).json({ message: "You have already disliked this blog" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error disliking blog", error });
  }
}
async function Undislike(req, res){
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.dislikes.includes(req.user.id)) {
      blog.dislikes.pull(req.user.id);
      await blog.save();
      res.status(200).json({ message: "Blog undisliked successfully" });
    } else {
      res.status(400).json({ message: "You have not disliked this blog" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error undisliking blog", error });
  }
}
async function DislikeCount(req, res){
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ dislikesCount: blog.dislikes.length });
  } catch (error) {
    res.status(500).json({ message: "Error getting dislikes count", error });
  }
}
module.exports = { Dislike , Undislike, DislikeCount};
