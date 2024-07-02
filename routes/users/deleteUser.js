const User = require("../../models/User");

async function DeleteUser(req, res) {
  try {
    // Retrieve the authenticated user from the request object (assuming you have a middleware that sets req.user)
    const user = req.user;

    // Ensure the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user from the database
    await User.findByIdAndDelete(user._id);

    // Perform any additional cleanup or logging out operations if needed
    req.logOut(); // Example: Logout the user after account deletion

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete account" });
  }
}

module.exports = DeleteUser;

