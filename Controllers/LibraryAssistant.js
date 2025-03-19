require("dotenv").config();
const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = "http://localhost:4000"; // Адрес API библиотеки

class LibraryAssistant {
  constructor() {
    this.processUserQuery = this.processUserQuery.bind(this);
  }

  // Обработка запроса пользователя
  async processUserQuery(req, res) {
    const { userQuery } = req.body;

    try {
      // 1. AI анализирует запрос и извлекает данные
      const extractedData = await this.extractBookData(userQuery);

      if (!extractedData.query) {
        return res.status(400).json({ message: "Ошибка: запрос пустой." });
      }

      // 2. Запрос в векторную базу данных (Weaviate)
      const searchResponse = await axios.post(
        `${BASE_URL}/weaviate/search/book`,
        extractedData
      );

      const books = searchResponse.data?.data?.data?.Get?.Book || [];

      if (books.length === 0) {
        return res.status(404).json({ message: "Простите, но книга не найдена." });
      }

      // 3. AI проверяет, какая книга из Weaviate соответствует запросу
      const bestMatch = await this.validateBookMatch(userQuery, books);

      if (bestMatch) {
        return res.status(200).json({
          message: "Вот что я нашёл:",
          book: {
            title: bestMatch.title,
            author: bestMatch.author,
            description: bestMatch.description,
            keywords: bestMatch.keywords,
          },
        });
      } else {
        return res.status(200).json({
          message: "Не нашёл точного совпадения, но вот похожие книги:",
          books: books.map((book) => ({
            title: book.title,
            author: book.author,
            description: book.description,
            keywords: book.keywords,
          })),
        });
      }
    } catch (error) {
      console.error("Ошибка:", error.response?.data || error.message);
      res.status(500).json({
        error: "Ошибка в работе AI ассистента",
        details: error.response?.data || error.message,
      });
    }
  }

  // AI проверяет, соответствует ли книга запросу пользователя
  async validateBookMatch(userQuery, books) {
    try {
      const gptResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "Ты библиотечный ассистент. Твоя задача — определить, какая из предложенных книг соответствует запросу пользователя. Если ни одна не подходит, верни пустой ответ.",
            },
            { role: "user", content: `Запрос: ${userQuery}` },
            {
              role: "assistant",
              content: `Вот список книг: ${books
                .map((book, index) => `${index + 1}. ${book.title} - ${book.author}`)
                .join(", ")}`,
            },
          ],
          functions: [
            {
              name: "select_best_match",
              description: "Выбирает лучшую книгу по запросу",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Название книги (если найдено)" },
                  author: { type: "string", description: "Автор книги (если найдено)" },
                },
              },
            },
          ],
          function_call: { name: "select_best_match" },
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = JSON.parse(gptResponse.data.choices[0].message.function_call.arguments);

      return books.find(
        (book) =>
          data.title &&
          book.title.toLowerCase() === data.title.toLowerCase() &&
          book.author.toLowerCase() === data.author.toLowerCase()
      );
    } catch (error) {
      console.error("Ошибка при проверке книги:", error.message);
      return null;
    }
  }

  // AI извлекает данные из запроса пользователя
  async extractBookData(userQuery) {
    try {
      const gptResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "Ты библиотечный ассистент. Извлекай название книги (title) и автора (author). Например, 'Қара сөздер' – это книга Абая Кунанбаева, а 'Абай жолы' – это книга Мухтара Ауэзова. Не путай их.",
            },
            { role: "user", content: userQuery },
          ],
          functions: [
            {
              name: "extract_book_data",
              description: "Извлечение информации о книге",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string", description: "Исходный запрос" },
                  title: { type: "string", description: "Название книги" },
                  author: { type: "string", description: "Автор книги" },
                },
                required: ["query"],
              },
            },
          ],
          function_call: { name: "extract_book_data" },
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = JSON.parse(gptResponse.data.choices[0].message.function_call.arguments);
      return data;
    } catch (error) {
      console.error("Ошибка при извлечении данных:", error.message);
      return { query: userQuery, title: "", author: "" };
    }
  }
}

module.exports = new LibraryAssistant();
