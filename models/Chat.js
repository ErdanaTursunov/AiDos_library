// models/Chat.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Chat = sequelize.define("Chat", {
  userId: {
    type: DataTypes.INTEGER, // Или UUID, если юзеры хранятся по UUID
    allowNull: false,
  },
  messages: {
    type: DataTypes.JSONB, // Храним массив сообщений
    allowNull: false,
    defaultValue: [],
  },
});

module.exports = Chat;
