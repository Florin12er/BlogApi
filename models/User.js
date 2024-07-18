require('dotenv').config();
const mongoose = require("mongoose");
const crypto = require("crypto");


const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 characters for AES-256
const IV_LENGTH = 16; // For AES, this is always 16

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  resetCode: { type: String },
  resetCodeExpires: { type: Date },
  profilePicture: { type: String },
  isGuest: { type: Boolean, default: false },
  apiKey: { type: String },
});

userSchema.methods.encryptText = function (text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

userSchema.methods.decryptText = function (text) {
  if (!text) {
    console.log('No text provided for decryption');
    return null;
  }

  try {
    const textParts = text.split(':');
    if (textParts.length < 2) {
      console.log('Invalid encrypted text format');
      return null;
    }

    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Error decrypting text:', error);
    return null;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;

