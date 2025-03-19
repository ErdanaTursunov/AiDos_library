require("dotenv").config();
const axios = require("axios");

const WEAVIATE_URL = "http://localhost:8080/v1";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

class Weaviatebookcreate {
  constructor() {
    this.getOpenAIEmbedding = this.getOpenAIEmbedding.bind(this);
    this.AddBook = this.AddBook.bind(this);
    this.searchBooks = this.searchBooks.bind(this);
  }

  // Получаем эмбеддинг только для description и keywords
  async getOpenAIEmbedding(text) {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/embeddings",
        {
          input: text,
          model: "text-embedding-3-small",
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data[0].embedding;
    } catch (error) {
      console.error(
        "Ошибка при получении эмбеддинга:",
        error.response?.data || error.message
      );
      throw new Error("Ошибка при создании вектора");
    }
  }

  // Добавление книги в Weaviate
  async AddBook(req, res) {
    const { title, author, description, keywords } = req.body;

    try {
      // Создаём более осмысленный текст
      const extendedTitle = `Название книги — ${title}, книга о ...`;
      const extendedAuthor = `Автор книги — ${author}, известный писатель.`;

      // Получаем эмбеддинги
      const titleEmbedding = await this.getOpenAIEmbedding(extendedTitle);
      const authorEmbedding = await this.getOpenAIEmbedding(extendedAuthor);
      const descEmbedding = await this.getOpenAIEmbedding(
        `${description} ${keywords}`
      );

      // Усредняем эмбеддинги (опционально)
      const finalEmbedding = titleEmbedding.map(
        (val, i) => (val + authorEmbedding[i] + descEmbedding[i]) / 3
      );

      // Добавляем в Weaviate
      const data = {
        class: "Book",
        properties: { title, author, description, keywords },
        vector: finalEmbedding, // Сохраняем осмысленный вектор
      };

      const response = await axios.post(`${WEAVIATE_URL}/objects`, data);
      res.status(201).json({ message: "Книга добавлена", data: response.data });
    } catch (error) {
      res.status(500).json({
        error: "Ошибка при добавлении книги",
        details: error.response ? error.response.data : error.message,
      });
    }
  }

  // Поиск книг по вектору и фильтрация по title и author
  async searchBooks(req, res) {
    const { query, title, author } = req.body;

    try {
      let queryEmbedding = null;
      let titleEmbedding = null;
      let authorEmbedding = null;

      // Если есть поисковый запрос, получаем его эмбеддинг
      if (query) {
        queryEmbedding = await this.getOpenAIEmbedding(query);
      }

      // Если пользователь ввёл название книги, создаём осмысленный текст и эмбеддинг
      if (title) {
        const extendedTitle = `Название книги — ${title}, книга о ...`;
        titleEmbedding = await this.getOpenAIEmbedding(extendedTitle);
      }

      // Если пользователь ввёл автора, создаём осмысленный текст и эмбеддинг
      if (author) {
        const extendedAuthor = `Автор книги — ${author}, известный писатель.`;
        authorEmbedding = await this.getOpenAIEmbedding(extendedAuthor);
      }

      // Собираем все полученные эмбеддинги
      let combinedEmbedding = null;
      if (queryEmbedding && titleEmbedding && authorEmbedding) {
        combinedEmbedding = queryEmbedding.map(
          (val, i) => (val + titleEmbedding[i] + authorEmbedding[i]) / 3
        );
      } else if (queryEmbedding && titleEmbedding) {
        combinedEmbedding = queryEmbedding.map(
          (val, i) => (val + titleEmbedding[i]) / 2
        );
      } else if (queryEmbedding && authorEmbedding) {
        combinedEmbedding = queryEmbedding.map(
          (val, i) => (val + authorEmbedding[i]) / 2
        );
      } else {
        combinedEmbedding = queryEmbedding || titleEmbedding || authorEmbedding;
      }

      // Если вообще нет эмбеддингов — ошибка
      if (!combinedEmbedding) {
        return res.status(400).json({
          error:
            "Должен быть указан хотя бы один параметр: query, title или author",
        });
      }

      // GraphQL-запрос с векторным поиском
      let graphqlQuery = {
        query: `
            {
                Get {
                    Book(
                        nearVector: { vector: [${combinedEmbedding.join(
                          ","
                        )}] distance: 0.7 }
                    ) {
                        title
                        author
                        description
                        keywords
                    }
                }
            }
            `,
      };

      // Отправляем запрос
      const response = await axios.post(
        `${WEAVIATE_URL}/graphql`,
        graphqlQuery
      );

      // Если нет результатов
      if (
        !response.data?.data?.Get?.Book ||
        response.data.data.Get.Book.length === 0
      ) {
        return res.status(404).json({ message: "Книги не найдены" });
      }

      res
        .status(200)
        .json({ message: "Результаты поиска", data: response.data });
    } catch (error) {
      res.status(500).json({
        error: "Ошибка при поиске книг",
        details: error.response ? error.response.data : error.message,
      });
    }
  }
}

module.exports = new Weaviatebookcreate();
