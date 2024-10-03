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
        // console.log({ socketUser: user });
        return next();
      } catch (err) {
        console.log({ err: err?.response?.statusText });
        next(new Error("Authentication error"));
      }
    });

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined conversation ${conversationId}`, socket.user);
    });

    socket.on("sendMessage", async ({ conversationId, content }) => {
      if (!socket.user) {
        return socket.emit("error", "User not authenticated");
      }
      try {
        const senderId = socket.user.id;

        console.log("sendMessage", { conversationId, content, senderId });

        // Create the message in the database
        const message = await Message.create({
          conversationId: conversationId, // Ensure this is UUID
          senderId: senderId, // The ID of the user sending the message
          content: content, // Use "content" instead of "text"
          createdAt: new Date(), // Optional, as it will auto-generate if timestamps are used
        });

        // Update the lastMessageId in the conversation
        await Conversation.update(
          { lastMessageId: message.id },
          { where: { id: conversationId } }
        );

        // Emit the message to all users in the conversation
        io.to(conversationId).emit("newMessage", {
          user: socket.user.name, // Ensure you have access to the user's name
          message: message, // Send the message object
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
