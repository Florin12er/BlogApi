const User = require("../../models/User");
const Blog = require("../../models/Blog");

async function Settings(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let usernameChanged = false;
    let emailChanged = false;
    const oldUsername = user.username;
    const oldEmail = user.email;

    // Update username if provided in request body
    if (req.body.username && req.body.username !== user.username) {
      // Check if the new username is already taken
      const existingUserWithUsername = await User.findOne({ username: req.body.username });
      if (existingUserWithUsername && existingUserWithUsername._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      user.username = req.body.username;
      usernameChanged = true;
    }

    // Update email if provided in request body
    if (req.body.email && req.body.email !== user.email) {
      // Check if the new email is already taken by another user
      const existingUserWithEmail = await User.findOne({ email: req.body.email });
      if (existingUserWithEmail && existingUserWithEmail._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Email is already taken" });
      }
      user.email = req.body.email;
      emailChanged = true;
    }

    await user.save();

    // If username changed, update all related blogs
    if (usernameChanged) {
      // Update author in blogs
      await Blog.updateMany(
        { author: oldUsername },
        { $set: { author: user.username } }
      );

      // Update username in comments
      // Note: This is more complex because comments use User ObjectId, not username
      const blogs = await Blog.find({ "comments.user": user._id });
      for (let blog of blogs) {
        blog.comments.forEach(comment => {
          if (comment.user.toString() === user._id.toString()) {
            // We don't need to update the comment's user field as it's already correct (ObjectId)
            // But if you display the username somewhere in the comment, you might need to update it
          }
        });
        await blog.save();
      }
    }

    // Email changes don't need to be cascaded based on your current model structure

    res.status(200).json({
      message: "User settings updated successfully",
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in Settings:", error);
    res.status(500).json({ message: "Error updating user settings", error: error.message });
  }
}

module.exports = Settings;

