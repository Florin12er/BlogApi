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

    const user = await User.findById(req.user._id); // Fetching the authenticated user
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newComment = {
      user: userId,
      content,
    };

    blog.comments.push(newComment);
    await blog.save();

    res
      .status(201)
      .json({
        message: "Comment added successfully",
        comment: newComment,
        username: user.username,
      });
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
async function DeleteComment(req, res) {
  const { blogId, commentId } = req.params;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the authenticated user is the owner of the comment
    if (comment.user.username !== req.user.username) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this comment" });
    }

    comment.remove(); // Use remove() method to delete subdocument
    await blog.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
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
module.exports = { PostComment, UpdateComment, DeleteComment, ShowAllComments };
