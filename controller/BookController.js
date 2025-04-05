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

        // Проверяем, содержит ли запрос разделители
        if (query && (query.includes(' и ') || query.includes(' или '))) {
          // Разбиваем запрос на отдельные темы
          const searchTerms = query.split(/\s+(?:и|или)\s+/);
          console.log("Поиск по отдельным темам:", searchTerms);

          let allBooks = new Map(); // Используем Map для хранения уникальных книг

          // Выполняем поиск для каждой темы отдельно
          for (const term of searchTerms) {
            const cleanTerm = term.trim();
            if (cleanTerm) {
              console.log("Поиск по теме:", cleanTerm);
              
              // Выполняем поиск по описанию и UDC для каждого термина
              const [termBooksByDescription, termBooksByUdc] = await Promise.all([
                searchByDescription(cleanTerm),
                searchByUdc(cleanTerm)
              ]);

              // Добавляем найденные книги в общий Map
              [...termBooksByDescription, ...termBooksByUdc].forEach(book => {
                if (!allBooks.has(book.BR_ID)) {
                  allBooks.set(book.BR_ID, book);
                }
              });
            }
          }

          // Преобразуем Map в массив
          books = Array.from(allBooks.values());
          console.log(`Всего найдено уникальных книг: ${books.length}`);

        } else {
          // Стандартный поиск по одному запросу
          const [booksByDescription, booksByUdc] = await Promise.all([
            searchByDescription(query),
            searchByUdc(query)
          ]);

          // Объединяем результаты и убираем дубликаты
          const bookMap = new Map();
          [...booksByDescription, ...booksByUdc].forEach((book) => {
            bookMap.set(book.BR_ID, book);
          });

          books = Array.from(bookMap.values());
        }
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
