const { Op } = require("sequelize");
const Conversation = require("../models/conversation");
const Message = require("../models/message");

exports.createConversation = async (req, res) => {
  const { user2Id, name } = req.body; // Expecting user2Id from request body
  try {
    const user1Id = req.user.id; // The ID of the authenticated user

    // Validate that user2Id is provided
    if (!user2Id) {
      return res.status(400).json({ message: "User2 ID is required" });
    }

    // Create the conversation
    const conversation = await Conversation.create({
      user1Id,
      user2Id,
      name, // Optional, can be null if not provided
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: [
        {
          model: Message,
          limit: 20, // Limit to the latest 20 messages
          order: [["createdAt", "DESC"]], // Order messages by creation date
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json({ total: conversations.length, data: conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: error.message });
  }
};
