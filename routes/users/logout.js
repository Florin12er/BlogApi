function LogOut(req, res) {
  res.clearCookie("jwt", { path: '/' }); // Clear the JWT cookie
  return res.json({ message: "Logged out successfully" });
}

module.exports = LogOut;
