const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const sequelize = require("./src/config/db");
const Conversation = require("./src/models/conversation");
const Message = require("./src/models/message");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Sync with database
sequelize.sync();
// Define relationships
Conversation.hasMany(Message, { foreignKey: "conversationId" });
Message.belongsTo(Conversation, { foreignKey: "conversationId" });

// Create a new conversation
app.post("/api/conversations", async (req, res) => {
  try {
    const conversation = await Conversation.create(req.body);
    res.status(201).json(conversation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all conversations
app.get("/api/conversations", async (req, res) => {
  try {
    const conversations = await Conversation.findAll();
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific conversation by ID
app.get("/api/conversations/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findByPk(req.params.id);
    if (conversation) {
      res.status(200).json(conversation);
    } else {
      res.status(404).json({ error: "Conversation not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a new message
app.post("/api/messages", async (req, res) => {
  try {
    const message = await Message.create(req.body);
    io.to(req.body.conversationId).emit("newMessage", message); // Emit message to the specific conversation
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all messages for a specific conversation
app.get("/api/conversations/:id/messages", async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { conversationId: req.params.id },
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO Connection
io.on("connection", (socket) => {
  console.log("New user connected");

  // Create a new conversation
  socket.on("createConversation", async (name) => {
    const conversation = await Conversation.create({ name });
    socket.emit("conversationCreated", conversation);
  });

  // Listen for messages
  socket.on("sendMessage", async (data) => {
    const message = await Message.create(data);
    io.to(data.conversationId).emit("newMessage", message);
  });

  // Join a conversation room
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
