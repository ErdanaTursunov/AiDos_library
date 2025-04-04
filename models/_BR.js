const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('_BR', {
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
    OLD_PRIMARYBR_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    BR_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    BR_STATUS_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    BR_OWNER_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    DESC_LEVEL_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    DESC_TYPE_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    PUBLICATION_TYPE_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    LANG_CODE: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    SPHERE_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    NABRK_CATALOG_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    KAZNEB_CATALOG_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    IS_RARE: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    IS_KAZAKH: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    SHELFMARK: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    SIGLA_ORG_PARTNER_ID: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    VIEW_IN: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    DOWNLOAD_24_IN: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    DOWNLOAD_FULL_IN: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    VIEW_OUT: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    DOWNLOAD_24_OUT: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    DOWNLOAD_FULL_OUT: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    COPY_COUNT: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    AUTHOR: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    TITLE: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    ISXN: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    PUBLICATION_YEAR: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    IS_VOCABULARY: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    IS_ENCYCLOPEDIA: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    VOLUME_NUMBER: {
      type: DataTypes.STRING(32767),
      allowNull: true
    },
    'IS_CHILDREN") VALUES': {
      type: DataTypes.STRING(32767),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: '_BR',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_author_trgm",
        fields: [
          { name: "AUTHOR" },
        ]
      },
      {
        name: "idx_title_trgm",
        fields: [
          { name: "TITLE" },
        ]
      },
    ]
  });
};
