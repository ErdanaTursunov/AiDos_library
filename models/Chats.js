const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Chats', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    messages: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
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
    tableName: 'Chats',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Chats_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
