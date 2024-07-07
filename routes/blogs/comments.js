const Blog = require("../../models/Blog");
const User = require("../../models/User");

async function PostComment(req, res) {
  const { content } = req.body;
  const userId = await Blog.findById(req.params.id);

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const newComment = {
      user: userId,
      content,
    };

    blog.comments.push(newComment);
    await blog.save();

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error });
  }
}
async function UpdateComment(req, res) {
  const { content } = req.body;
  const userId = await User.findById(req.params.id);

  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.content = content;
    await blog.save();

    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (error) {
    res.status(500).json({ message: "Error updating comment", error });
  }
}
async function DeletComment(req, res) {
  const userId = req.user._id; // Assuming req.user has the authenticated user object

  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the authenticated user is the owner of the comment
    comment.deleteOne();
    await blog.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error });
  }
}

async function ShowAllComments(req, res) {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "comments.user",
      "username",
    );
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog.comments);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving comments", error });
  }
}
module.exports = { PostComment, UpdateComment, DeletComment, ShowAllComments };
