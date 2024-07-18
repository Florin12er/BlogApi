const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const blogSchema = new Schema({
  author: { type: String, required: true },
  title: { type: String, required: true },
  links: { type: String, required: true },
  tags: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [commentSchema], // Added comments array
});
blogSchema.index({ title: 'text', content: 'text', author: 'text' });

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
