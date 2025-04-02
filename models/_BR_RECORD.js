const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('_BR_RECORD', {
    USER_CHANGE: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    DATE_CHANGE: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    TIME_CHANGE: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    BR_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    U_COLUMN_CODE: {
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
    tableName: '_BR_RECORD',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_value",
        fields: [
          { name: "VALUE" },
        ]
      },
      {
        name: "idx_value_trgm",
        fields: [
          { name: "VALUE" },
        ]
      },
    ]
  });
};
