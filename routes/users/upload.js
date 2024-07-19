const User = require("../../models/User");

async function Upload(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePicture = `${req.file.filename}`;
    await user.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      filePath: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading profile picture", error });
  }
}
module.exports = Upload
