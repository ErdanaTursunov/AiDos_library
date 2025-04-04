const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('_ACADEMIC_TITLE', {
    ACADEMIC_TITLE_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    ACADEMIC_TITLE_NAME_KK: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    ACADEMIC_TITLE_NAME_RU: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    ACADEMIC_TITLE_NAME_EN: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    IS_DELETED: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: '_ACADEMIC_TITLE',
    schema: 'public',
    timestamps: false
  });
};
