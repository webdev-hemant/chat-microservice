const express = require("express");
const router = express.Router();
const {
  createConversation,
  getConversations,
} = require("../controller/conversationController");
const { getUserDetails } = require("../middleware/getUserDetails"); // Your existing middleware

// Fetch conversations
router.get("/", getUserDetails, getConversations);

// Create a new conversation
router.post("/create", getUserDetails, createConversation);

module.exports = router;
