const sequelize = require("../db");

async function searchByUdcTopic(topic) {
  try {
    let query = `
      SELECT DISTINCT "TITLE_INDEX_GI"
      FROM "_UDC"
      WHERE "MAIN_TOPIC" ILIKE :topic
      LIMIT 10
    `;

    let replacements = { topic: `%${topic}%` };

    const udcResults = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    console.log("udcResults", udcResults);

    if (udcResults.length === 0) {
      return [];
    }

    // 🔹 Очищаем TITLE_INDEX_GI от лишних символов
    const titleIndices = udcResults
      .map((row) =>
        row.TITLE_INDEX_GI?.trim().replace(/[^0-9A-Za-zа-яА-ЯёЁ.\s-]/g, "")
      )
      .filter((title) => title && title.length > 1); // Убираем пустые значения

    if (titleIndices.length === 0) {
      return [];
    }

    console.log("titleIndices", titleIndices);

    return titleIndices;
  } catch (error) {
    console.error("Ошибка в searchByDescription:", error);
    throw error;
  }
}

module.exports = searchByUdcTopic;
