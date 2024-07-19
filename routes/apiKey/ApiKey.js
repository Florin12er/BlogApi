const User = require("../../models/User");
const crypto = require("crypto");

const generateApiKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

async function GetApiKey(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const decryptedApiKey = user.decryptText(user.apiKey); // Decrypt API key
    res.status(200).json({ apiKey: decryptedApiKey }); // Respond with decrypted API key
  } catch (error) {
    console.error("Error retrieving API key:", error);
    res.status(500).json({ error: "Failed to retrieve API key" });
  }
}
async function GenerateApiKey(req, res){
  try {
    const apiKey = generateApiKey();
    const encryptedApiKey = req.user.encryptText(apiKey); // Encrypt the API key
    console.log("Encrypted API Key:", encryptedApiKey); // Add logging
    req.user.apiKey = encryptedApiKey;
    await req.user.save();
    res.status(200).json({ apiKey });
  } catch (error) {
    console.error("Error generating API key:", error);
    res.status(500).json({ error: "Failed to generate API key" });
  }
}

module.exports = {GetApiKey, GenerateApiKey}
