const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ArchivedChat = sequelize.define("ArchivedChat", {
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  message: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: "ArchivedChats",
  timestamps: true
});

module.exports = ArchivedChat;