function LogOut(req, res) {
  req.logOut((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to log out" });
    }
    return res.status(200).json({ message: "Logged out successfully" });
  });
}

module.exports = LogOut;
