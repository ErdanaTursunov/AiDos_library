const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('_UDC_RELATION', {
    ID_LEFT: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    'ID_RIGHT") VALUES': {
      type: DataTypes.STRING(32767),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: '_UDC_RELATION',
    schema: 'public',
    timestamps: false
  });
};
