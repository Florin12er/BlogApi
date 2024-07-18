const Blog = require("../../models/Blog");
const User = require("../../models/User");

async function PostComment(req, res) {
  const { content } = req.body;
  const userId = req.user._id; // Get the authenticated user's ID

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

    // Populate the user information
    await blog.populate('comments.user', 'username');
    const addedComment = blog.comments[blog.comments.length - 1];

    res.status(201).json({ message: "Comment added successfully", comment: addedComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
}

async function UpdateComment(req, res) {
  const { content } = req.body;
  const userId = req.user._id; // Get the authenticated user's ID

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
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }

    comment.content = content;
    await blog.save();

    // Populate the user information
    await blog.populate('comments.user', 'username').execPopulate();
    const updatedComment = blog.comments.id(req.params.commentId);

    res.status(200).json({ message: "Comment updated successfully", comment: updatedComment });
  } catch (error) {
    res.status(500).json({ message: "Error updating comment", error });
  }
}

async function DeleteComment(req, res) {
  const userId = req.user._id; // Get the authenticated user's ID

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
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

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
      "username"
    );
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog.comments);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving comments", error });
  }
}

module.exports = { PostComment, UpdateComment, DeleteComment, ShowAllComments };

