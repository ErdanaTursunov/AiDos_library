const sequelize = require("../db");

async function searchByAuthorTitle(author, title) {
  try {
    let query = `
      SELECT DISTINCT b."TITLE", b."AUTHOR"
      FROM "_BR" b
      WHERE 1=1
    `;
    let replacements = {};

    if (author) {
      query += ` AND b."AUTHOR" ILIKE :author`;
      replacements.author = `%${author}%`;
    }
    if (title) {
      query += ` AND b."TITLE" ILIKE :title`;
      replacements.title = `%${title}%`;
    }

    query += ` LIMIT 10;`;

    return await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
  } catch (error) {
    console.error("Ошибка в searchByAuthorTitle:", error);
    throw error;
  }
}

module.exports = searchByAuthorTitle;
