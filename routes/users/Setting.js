const User = require("../../models/User");

async function Settings(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update username if provided in request body
    if (req.body.username) {
      user.username = req.body.username;
    }

    // Update email if provided in request body
    if (req.body.email) {
      // Check if the new email is already taken by another user
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Email is already taken" });
      }
      user.email = req.body.email;
    }

    await user.save();

    res.status(200).json({
      message: "User settings updated successfully",
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user settings", error });
  }
}
module.exports = Settings
