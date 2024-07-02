const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  resetCode: { type: String },
  resetCodeExpires: { type: Date },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
