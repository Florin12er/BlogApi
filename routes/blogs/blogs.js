const express = require("express")
const router = express.Router()

router.get("/", SendBlog)

function SendBlog(req, res) {
    res.json({message: "this is the blog route"})
}
module.exports = router
