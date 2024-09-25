const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Adjust path as necessary

const Message = sequelize.define(
  "Message",
  {
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Conversations",
        key: "id",
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Message;
