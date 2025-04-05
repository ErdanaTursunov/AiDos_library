const sequelize = require("../db");

async function searchByDescription(description) {
  try {
    const query = `
      SELECT DISTINCT b."TITLE", b."AUTHOR", b."BR_ID"
      FROM "_BR" b
      WHERE b."TITLE" IS NOT NULL 
        AND b."TITLE" <> '' 
        AND b."TITLE" <> ''''
        AND EXISTS (
          SELECT 1 FROM "_BR_RECORD" r
          WHERE r."BR_ID" = b."BR_ID"
          AND r."VALUE" ILIKE :description
        )
      LIMIT 10;
    `;

    const replacements = { description: `%${description}%` };

    console.log('Поиск по описанию:', description);

    return await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
  } catch (error) {
    console.error("Ошибка в searchByDescription:", error);
    throw error;
  }
}

module.exports = searchByDescription;
