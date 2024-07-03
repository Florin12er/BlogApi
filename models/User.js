const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  resetCode: { type: String },
  resetCodeExpires: { type: Date },
  profilePicture: { type: String },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // List of followers
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }], // List of users being followed
});

userSchema.methods.isValidPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;

