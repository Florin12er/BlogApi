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
      res.clearCookie("connect.sid", { path: '/' }); // Ensure path is correctly set
      return res.json({ message: "Logged out successfully" });
    });
  });
}

module.exports = LogOut;

