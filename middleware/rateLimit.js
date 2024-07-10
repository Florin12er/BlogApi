const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Rate limiting middleware configuration
const apiKeyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests for generating API key, please try again later.'
});
module.exports = apiKeyLimiter
