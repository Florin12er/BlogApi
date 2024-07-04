const Blog = require("../../models/Blog");

const getBlog = async (id) => {
  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new Error("Blog not found");
    }
    return blog;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve blog information");
  }
};

async function GetUserBlogById(req, res) {
  try {
    const id = req.params.id;

    // Validate if 'id' is a valid ObjectId before querying
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid blog ID format" });
    }

    const blog = await getBlog(id);
    res.status(200).json({ blog });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Blog not found" });
  }
}

module.exports = GetUserBlogById;

