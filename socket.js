const Conversation = require("./src/models/conversation");
const Message = require("./src/models/message");
const { verifyToken } = require("./src/utils");

const runSocket = (io) => {
  // Socket.IO Connection
  io.on("connection", (socket) => {
    console.log("A user connected");

    // Verify token for user authentication
    io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      try {
        const user = await verifyToken(token);
        socket.user = user;
        return next();
      } catch (err) {
        console.log({ err: err?.response?.statusText });
        next(new Error("Authentication error"));
      }
    });

    socket.on("joinConversation", (conversationId) => {
      console.log(`${socket?.user?.username} joined room ${conversationId}`);
      socket.join(conversationId);
    });

    socket.on("sendMessage", async ({ conversationId, content }) => {
      if (!socket.user) {
        return socket.emit("error", "User not authenticated");
      }
      if (!content) {
        return socket.emit("error", "Message cannot be emty!");
      }
      try {
        const senderId = socket.user.id;

        // Create the message in the database
        const message = await Message.create({
          conversationId: conversationId, // Ensure this is UUID
          senderId: senderId, // The ID of the user sending the message
          content: content, // Use "content" instead of "text"
          createdAt: new Date(), // Optional, as it will auto-generate if timestamps are used
        });

        // // Update the lastMessageId in the conversation
        await Conversation.update(
          { lastMessageId: message?.dataValues?.id },
          { where: { id: conversationId } }
        );

        // Emit the message to all users in the conversation
        io.to(conversationId).emit("newMessage", {
          user: socket.user.username, // Ensure you have access to the user's name
          message: content, // Send the message object
        });
      } catch (error) {
        console.error("Message sending error:", error);
        socket.emit("error", "Failed to send message");
      }
    });

    socket.on("readMessages", async (conversationId) => {
      await Message.update(
        { isRead: true },
        { where: { conversationId, isRead: false } }
      );
      await Conversation.update(
        { unreadCount: 0 },
        { where: { id: conversationId } }
      );
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

module.exports = { runSocket };
