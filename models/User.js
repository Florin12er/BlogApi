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
  isGuest: { type: Boolean, default: false },
  apiKey: { type: String, unique: true }, // Add API key field
});

userSchema.methods.isValidPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
userSchema.methods.updateUserDetails = async function (updates) {
  Object.assign(this, updates);
  await this.save();
};

const User = mongoose.model("User", userSchema);

module.exports = User;

