const searchByAuthorTitle = require("../services/searchByAuthorTitle");
const searchByDescription = require("../services/searchByDescription");
const searchByUdc = require("../services/searchByUdc");

class BookController {
  static async searchBooks(req, res) {
    try {
      const { author = "", title = "", query = "" } = req.body;

      let books = [];

      if (title || author) {
        books = await searchByAuthorTitle(author, title);
      } else {
        console.log("Выполняем поиск по query:", query);

        // Выполняем поиск по описанию и UDC в одном запросе
        const [booksByDescription, booksByUdc] = await Promise.all([
          searchByDescription(query),
          searchByUdc(query),
        ]);

        // Объединяем результаты и убираем дубликаты по BR_ID
        const bookMap = new Map();
        [...booksByDescription, ...booksByUdc].forEach((book) => {
          bookMap.set(book.BR_ID, book);
        });

        books = Array.from(bookMap.values());
      }

      if (typeof res.json === 'function') {
        return res.json({ books });
      } else {
        // Для случая, когда res - это mock объект из ChatController
        res.json({ books });
      }
    } catch (error) {
      console.error("Ошибка при поиске книг:", error);
      if (typeof res.status === 'function') {
        return res.status(500).json({ error: "Ошибка сервера" });
      } else {
        // Для случая, когда res - это mock объект из ChatController
        res.json({ error: "Ошибка сервера", books: [] });
      }
    }
  }
}

module.exports = BookController;
