const User = require("../../models/User");

async function Guest(req, res){
  try {
    // Create a new guest user
    const guestUser = new User({
      username: `guest_${Math.floor(Math.random() * 100000)}`,
      email: `guest_${Math.floor(Math.random() * 100000)}@example.com`,
      isGuest: true,
    });

    await guestUser.save();

    // Generate a JWT token for the guest user
    const token = jwt.sign({ userId: guestUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, userId: guestUser._id });
  } catch (error) {
    console.error("Error creating guest user:", error);
    res.status(500).json({ error: "Failed to create guest user" });
  }
}
module.exports = Guest
