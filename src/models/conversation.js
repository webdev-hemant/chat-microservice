const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Adjust path as necessary

const Conversation = sequelize.define(
  "Conversation",
  {
    name: {
      type: DataTypes.STRING,
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

module.exports = Conversation;
