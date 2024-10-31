const Conversation = require("../models/conversation");
const Message = require("../models/message");

const joinConversation = (socket, conversationId) => {
  console.log(`${socket?.user?.username} joined room ${conversationId}`);
  socket.join(conversationId);
};

const sendMessage = async (socket, io, { conversationId, content }) => {
  if (!socket.user) {
    return socket.emit("error", "User not authenticated");
  }
  if (!content) {
    return socket.emit("error", "Message cannot be empty!");
  }
  try {
    const senderId = socket.user.id;
    const message = await Message.create({
      conversationId,
      senderId,
      content,
      createdAt: new Date(),
    });

    await Conversation.update(
      { lastMessageId: message?.dataValues?.id },
      { where: { id: conversationId } }
    );

    io.to(conversationId).emit("newMessage", {
      user: socket.user.username,
      message: content,
    });
  } catch (error) {
    console.error("Message sending error:", error);
    socket.emit("error", "Failed to send message");
  }
};

const readMessages = async (conversationId) => {
  await Message.update(
    { isRead: true },
    { where: { conversationId, isRead: false } }
  );
  await Conversation.update(
    { unreadCount: 0 },
    { where: { id: conversationId } }
  );
};

module.exports = { joinConversation, sendMessage, readMessages };
