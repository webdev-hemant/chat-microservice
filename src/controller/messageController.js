const { Op } = require("sequelize");
const Conversation = require("../models/conversation");
const Message = require("../models/message");

exports.getMessagesByConversation = async (req, res) => {
  const userId = req.user.id;
  const conversationId = req.params.conversationId;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

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

    // Fetch paginated messages associated with the conversation
    const { rows: messages, count: totalMessages } =
      await Message.findAndCountAll({
        where: { conversationId },
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

    // Calculate total pages
    const totalPages = Math.ceil(totalMessages / limit);

    res.status(200).json({
      pagination: {
        totalMessages,
        totalPages,
        currentPage: page,
        limit,
      },
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: error.message });
  }
};
