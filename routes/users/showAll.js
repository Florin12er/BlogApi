const User = require('../../models/User'); // Adjust path as necessary

// GET all users
async function showAllUsers(req, res, next) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = showAllUsers;
