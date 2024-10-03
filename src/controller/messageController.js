const { Op } = require("sequelize");
const Conversation = require("../models/conversation");
const Message = require("../models/message");

exports.getMessagesByConversation = async (req, res) => {
  const userId = req.user.id; // Get the authenticated user's ID
  const conversationId = req.params.conversationId; // Get the conversation ID from the request parameters

  try {
    // Validate if the conversation exists for the user
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    // Check if conversation exists and the user has access
    if (!conversation) {
      return res
        .status(404)
        .json({ message: "Conversation not found or you do not have access." });
    }

    // Fetch messages associated with the conversation
    const messages = await Message.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: error.message });
  }
};
