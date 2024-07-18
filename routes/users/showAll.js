const User = require('../../models/User'); // Adjust path as necessary

// GET all users with pagination
async function showAllUsers(req, res, next) {
  try {
    // Get page and limit from query parameters, set defaults if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Get total count of users
    const total = await User.countDocuments();

    // Find users with pagination
    const users = await User.find()
      .select('-password -resetCode -resetCodeExpires') // Exclude sensitive fields
      .sort({ username: 1 }) // Sort by username alphabetically
      .skip(skip)
      .limit(limit);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Send response
    res.json({
      users,
      currentPage: page,
      totalPages,
      totalUsers: total
    });
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = showAllUsers;

