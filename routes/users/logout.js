function LogOut(req, res) {
  req.logout((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to log out" });
    }
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to log out" });
      }
      res.clearCookie("connect.sid"); // Clear the session cookie
      res.json({ message: "Log out successfully" }); // Redirect to home page or desired route after logout
    });
  });
}

module.exports = LogOut;
