const sequelize = require("../db");
const searchByUdcTopic = require("./searchByUdcTopic");

async function searchByUdc(topic) {
  try {
    // 🔹 Шаг 1: Ищем TITLE_INDEX_GI по MAIN_TOPIC
    const titleIndices = await searchByUdcTopic(topic);

    if (titleIndices.length === 0) {
      return []; // Если нет подходящих индексов, сразу возвращаем пустой массив
    }

    // 🔹 Шаг 2: Формируем условия ILIKE для поиска в _BR_RECORD
    const ilikeConditions = titleIndices
      .map((_, index) => `r."VALUE" ILIKE :title${index}`)
      .join(" OR ");

    const replacements = titleIndices.reduce((acc, title, index) => {
      acc[`title${index}`] = `%${title}%`;
      return acc;
    }, {});

    // 🔹 Шаг 3: Выполняем поиск книг
    const query = `
      SELECT DISTINCT b."TITLE", b."AUTHOR", b."BR_ID"
      FROM "_BR" b
      WHERE b."TITLE" IS NOT NULL 
        AND b."TITLE" <> ''  
        AND b."TITLE" <> ''''  
        AND b."TITLE" NOT LIKE '%''%' 
        AND EXISTS (
          SELECT 1 FROM "_BR_RECORD" r
          WHERE r."BR_ID" = b."BR_ID"
          AND (${ilikeConditions})
        )
      LIMIT 20;
    `;

    // 🔹 Шаг 4: Получаем книги
    let books = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    // 🔹 Шаг 5: Фильтруем книги, оставляя только те, где TITLE совпадает с `titleIndices`
    books = books.filter((book) => 
      titleIndices.some((indexTitle) => book.TITLE.toLowerCase().includes(indexTitle.toLowerCase()))
    );

    return books;
  } catch (error) {
    console.error("Ошибка в searchByUdc:", error);
    throw error;
  }
}

module.exports = searchByUdc;
