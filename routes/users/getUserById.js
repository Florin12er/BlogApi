const User = require("../../models/User");

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
async function GetUserByID(req, res) {
  try {
    const id = req.params.id;
    const user = await getUser(id);
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "User not found" });
  }
}

module.exports = GetUserByID
