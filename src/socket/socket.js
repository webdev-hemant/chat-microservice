const {
  joinConversation,
  sendMessage,
  readMessages,
} = require("./socketFunctions");
const { authenticateSocket } = require("./socketMiddleware");

const runSocket = (io) => {
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinConversation", (conversationId) => {
      joinConversation(socket, conversationId);
    });

    socket.on("sendMessage", (data) => {
      sendMessage(socket, io, data);
    });

    socket.on("readMessages", (conversationId) => {
      readMessages(conversationId);
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
