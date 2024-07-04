const User = require("../../models/User");

async function Follow(req, res) {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser.following.includes(userToFollow._id)) {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);

      await currentUser.save();
      await userToFollow.save();

      res.status(200).json({ message: "User followed successfully" });
    } else {
      res.status(400).json({ message: "You are already following this user" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error following user", error });
  }
}
async function Unfollow(req, res) {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(req.user.id);
    const followingIndex = currentUser.following.indexOf(userToUnfollow._id);
    const followersIndex = userToUnfollow.followers.indexOf(currentUser._id);

    if (followingIndex > -1) {
      currentUser.following.splice(followingIndex, 1);
      userToUnfollow.followers.splice(followersIndex, 1);

      await currentUser.save();
      await userToUnfollow.save();

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      res.status(400).json({ message: "You are not following this user" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error unfollowing user", error });
  }
}
async function Followers(req, res) {
  try {
    const user = await User.findById(req.user.id).populate(
      "followers",
      "username email",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ followersCount: user.followers.length });
  } catch (error) {
    res.status(500).json({ message: "Error getting followers count", error });
  }
}
async function Following(req, res) {
  try {
    const user = await User.findById(req.user.id).populate(
      "following",
      "username email",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ followingCount: user.following.length });
  } catch (error) {
    res.status(500).json({ message: "Error getting following count", error });
  }
}

module.exports = { Follow, Unfollow, Followers, Following };
