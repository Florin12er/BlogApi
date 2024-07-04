const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  author: { type: String, required: true }, // Added required: true to author field
  title: { type: String, required: true },
  links: { type: String, required: true },
  tags: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of user IDs who liked the blog
  dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of user IDs who disliked the blog
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
