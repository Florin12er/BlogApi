const User = require("../../models/User");

// Function to fetch user from database by ID
const getUser = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to retrieve user information');
  }
};

// Controller function to handle GET request for user by ID
async function GetUserByID(req, res) {
  try {
    const id = req.params.id;
    const user = await getUser(id); // Call getUser function to fetch user

    // Extract necessary fields from user object
    const { _id, username, email, profilePicture } = user;

    // Respond with user object including username and email
    res.status(200).json({ _id, username, email, profilePicture });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "User not found" }); // Handle errors appropriately
  }
}

module.exports = GetUserByID;

