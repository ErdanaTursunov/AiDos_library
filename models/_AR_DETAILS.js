const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('_AR_DETAILS', {
    AR_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    AR_COLUMN_CODE: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    FIELD_NUM: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    COLUMN_NUM: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    VALUE: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    'UPPER_VALUE") VALUES': {
      type: DataTypes.STRING(32767),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: '_AR_DETAILS',
    schema: 'public',
    timestamps: false
  });
};
