const User = require('../../models/User'); // Adjust path as necessary

// GET all users
async function ShowAllUsers(req, res) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = ShowAllUsers;

