const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../../models/User");

async function PostRegister(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });
    const result = await user.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  PostRegister,
};
