const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const sequelize = require("./src/config/db");
const Conversation = require("./src/models/conversation");
const Message = require("./src/models/message");
const { SERVER_PORT } = require("./src/config/allEnv");
const { runSocket } = require("./src/socket/socket");
const messageRoutes = require("./src/routes/messageRoutes");
const conversationRoutes = require("./src/routes/conversationRoutes");
const app = express();
const server = http.createServer(app);
const PORT = SERVER_PORT;
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

//initialize socket
runSocket(io);

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Define relationships
  Conversation.hasMany(Message, {
    foreignKey: "conversationId",
    onDelete: "CASCADE",
  });
  Message.belongsTo(Conversation, { foreignKey: "conversationId" });

  // Sync with database
  sequelize.sync();
});
