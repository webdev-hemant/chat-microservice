const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user1Id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user2Id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true, // Optional, depending on whether you want to support named conversations
    },
    unreadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastMessageId: {
      type: DataTypes.UUID,
      allowNull: true, // Optional, depending on your message structure
    },
  },
  {
    tableName: "conversations",
    timestamps: true, // This will automatically manage createdAt and updatedAt
  }
);

module.exports = Conversation;
