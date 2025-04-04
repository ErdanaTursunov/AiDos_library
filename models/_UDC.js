const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('_UDC', {
    TITLE_INDEX_GI: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    PARENT_INDEX: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    MAIN_TOPIC: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    'REFERENCESS") VALUES': {
      type: DataTypes.STRING(32767),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: '_UDC',
    schema: 'public',
    timestamps: false
  });
};
