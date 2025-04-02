const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('_COPY', {
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
    COPY_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    PART_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    SUBSCRIPTION_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    BR_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    LOCATION_DEP_CODE: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    INVENTORY_NUMBER: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    BARCODE: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    AUTOGRAPH: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    SUB_COPY_COUNT: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    PRINT_DATE: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    PRINT_TIME: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    MOBILE_INVENTORIZED: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    'PERMANENT_LOC_DEP_CODE") VALUES': {
      type: DataTypes.STRING(32767),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: '_COPY',
    schema: 'public',
    timestamps: false
  });
};
