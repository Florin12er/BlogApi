const bcrypt = require("bcrypt");
const User = require("../../models/User");
const sendResetCode = require("../../middleware/sendResetCode");

async function requestPasswordReset(req, res) {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const resetCode = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit code
    const saltRounds = 10;
    const hashedResetCode = await bcrypt.hash(resetCode, saltRounds);
    user.resetCode = hashedResetCode;
    // Set resetCodeExpires to one hour from now
    const resetCodeExpires = new Date(Date.now() + 3600000);
    // Format the date as "day/month/year"
    const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
    user.resetCodeExpires = resetCodeExpires.toLocaleDateString(undefined, options);
    await user.save();
    await sendResetCode(email, resetCode);
    return res.status(200).json({ message: "Reset code sent to your email" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to send reset code" });
  }
}
async function Reset(req, res) {
  const { email, resetCode, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or reset code" });
    }
    if (user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ error: "Reset code has expired" });
    }
    const hashedResetCode = await bcrypt.hash(resetCode, 10); // Hash the resetCode from the request body
    const isCodeValid = bcrypt.compare(hashedResetCode, user.resetCode); // Compare the hashed resetCode with the user.resetCode
    if (!isCodeValid) {
      return res.status(400).json({ error: "Invalid email or reset code" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to reset password" });
  }
}
module.exports = { requestPasswordReset, Reset };
