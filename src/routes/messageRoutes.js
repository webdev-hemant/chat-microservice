const express = require("express");
const router = express.Router();
const messageController = require("../controller/messageController");
const { getUserDetails } = require("../middleware/getUserDetails");

router.get(
  "/:conversationId",
  getUserDetails,
  messageController.getMessagesByConversation
);

module.exports = router;
