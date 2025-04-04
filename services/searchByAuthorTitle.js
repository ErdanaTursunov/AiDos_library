const sequelize = require("../db");

async function searchByAuthorTitle(author, title) {
  try {
    console.log('Searching by author:', author, 'title:', title);
    
    let query = `
      SELECT DISTINCT b."TITLE", b."AUTHOR", b."BR_ID"
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

    console.log('SQL Query:', query);
    console.log('Replacements:', replacements);

    const results = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    console.log('Search results:', results);
    return results;
    
  } catch (error) {
    console.error("Ошибка в searchByAuthorTitle:", error);
    throw error;
  }
}

module.exports = searchByAuthorTitle;
