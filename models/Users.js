const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Users', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ticket: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "Users_ticket_key4"
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Users',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Users_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "Users_ticket_key",
        unique: true,
        fields: [
          { name: "ticket" },
        ]
      },
      {
        name: "Users_ticket_key1",
        unique: true,
        fields: [
          { name: "ticket" },
        ]
      },
      {
        name: "Users_ticket_key2",
        unique: true,
        fields: [
          { name: "ticket" },
        ]
      },
      {
        name: "Users_ticket_key3",
        unique: true,
        fields: [
          { name: "ticket" },
        ]
      },
      {
        name: "Users_ticket_key4",
        unique: true,
        fields: [
          { name: "ticket" },
        ]
      },
    ]
  });
};
