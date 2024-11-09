const express = require("express");
const router = express.Router();
const {
  createConversation,
  getConversations,
} = require("../controller/conversationController");
const { getUserDetails } = require("../middleware/getUserDetails"); // Your existing middleware

// Fetch conversations
router.get("/:userId", getConversations);

// Create a new conversation
router.post("/create", getUserDetails, createConversation);

module.exports = router;
