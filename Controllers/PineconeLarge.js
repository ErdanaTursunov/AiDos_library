// const { Pinecone } = require("@pinecone-database/pinecone");
// const { OpenAI } = require("openai");
// const dotenv = require("dotenv");
// const crypto = require("crypto");

// dotenv.config();

// const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

// class PineconeLarge {
//   constructor() {
//     this.addToPinecone = this.addToPinecone.bind(this);
//     this.searchPinecone = this.searchPinecone.bind(this);
//   }

//   async embedText(text) {
//     const response = await openai.embeddings.create({
//       model: "text-embedding-3-large",
//       input: Array.isArray(text) ? text : [text],
//     });

//     if (!response.data || !response.data.length) {
//       throw new Error("Ошибка при получении эмбеддинга");
//     }

//     return response.data.map((item) => item.embedding);
//   }

//   async searchPinecone(req, res) {
//     try {
//       const { query, topK = 5 } = req.body;
//       if (!query) {
//         return res.status(400).json({ error: "Отсутствует запрос" });
//       }

//       const [queryVectorDesc, queryVectorKeywords] = await this.embedText([
//         query,
//         query,
//       ]);

//       const resultsDesc = await index.query({
//         vector: queryVectorDesc,
//         topK,
//         includeMetadata: true,
//       });

//       const resultsKeywords = await index.query({
//         vector: queryVectorKeywords,
//         topK,
//         includeMetadata: true,
//       });

//       const scoreWeightDesc = 0.7;
//       const scoreWeightKeywords = 0.3;
//       const MIN_SCORE_THRESHOLD = 0.4;

//       const combinedResults = {};
//       let countDesc = 0;
//       let countKeywords = 0;

//       if (resultsDesc.matches) {
//         resultsDesc.matches.forEach((match) => {
//           if (match.score >= MIN_SCORE_THRESHOLD) {
//             combinedResults[match.id] = {
//               id: match.id,
//               score: match.score * scoreWeightDesc,
//               metadata: {
//                 ...match.metadata,
//                 source: "description",
//                 scoreDesc: match.score.toFixed(4), // Добавляем в metadata оценку по description
//               },
//             };
//             countDesc++;
//             console.log(
//               `🔹 Найдено по description | ID: ${
//                 match.id
//               } | Score: ${match.score.toFixed(4)}`
//             );
//           }
//         });
//       }

//       if (resultsKeywords.matches) {
//         resultsKeywords.matches.forEach((match) => {
//           if (match.score >= MIN_SCORE_THRESHOLD) {
//             if (combinedResults[match.id]) {
//               combinedResults[match.id].score +=
//                 match.score * scoreWeightKeywords;
//               combinedResults[match.id].metadata.source = "both"; // Найдено по обоим критериям
//               combinedResults[match.id].metadata.scoreKeywords =
//                 match.score.toFixed(4); // Добавляем score по keywords
//             } else {
//               combinedResults[match.id] = {
//                 id: match.id,
//                 score: match.score * scoreWeightKeywords,
//                 metadata: {
//                   ...match.metadata,
//                   source: "keywords",
//                   scoreKeywords: match.score.toFixed(4), // Добавляем score по keywords
//                 },
//               };
//               countKeywords++;
//             }
//             console.log(
//               `🔸 Найдено по keywords | ID: ${
//                 match.id
//               } | Score: ${match.score.toFixed(4)}`
//             );
//           }
//         });
//       }

//       console.log(`✅ Найдено только по description: ${countDesc}`);
//       console.log(`✅ Найдено только по keywords: ${countKeywords}`);
//       console.log(
//         `✅ Общее количество уникальных результатов: ${
//           Object.keys(combinedResults).length
//         }`
//       );

//       // Нормализация оценок (опционально)
//       const maxScore = Math.max(
//         ...Object.values(combinedResults).map((r) => r.score),
//         1
//       );
//       Object.values(combinedResults).forEach((r) => (r.score /= maxScore));

//       const finalResults = Object.values(combinedResults)
//         .sort((a, b) => b.score - a.score)
//         .slice(0, topK);

//       res.json(finalResults);
//     } catch (error) {
//       console.error("Ошибка при поиске в Pinecone:", error);
//       res.status(500).json({ error: "Ошибка сервера" });
//     }
//   }

//   async addToPinecone(req, res) {
//     try {
//       let { data } = req.body;

//       if (!Array.isArray(data) || data.length === 0) {
//         return res.status(400).json({ error: "Отсутствуют данные" });
//       }

//       const records = await Promise.all(
//         data.map(async (item) => {
//           if (!item.description || !item.keywords) {
//             throw new Error(
//               "Отсутствует description или keywords у одного из объектов"
//             );
//           }

//           const [vectorDescription, vectorKeywords] = await Promise.all([
//             this.embedText(item.description),
//             this.embedText(item.keywords.join(", ")), // Объединяем ключевые слова в строку
//           ]);

//           const id = crypto
//             .createHash("md5")
//             .update(item.title + item.author)
//             .digest("hex")
//             .slice(0, 8);

//           return {
//             id,
//             values: vectorDescription[0].map(
//               (v, i) => v * 0.7 + vectorKeywords[0][i] * 0.3
//             ), // Комбинируем вектора
//             metadata: {
//               title: item.title,
//               author: item.author,
//               year: item.year,
//               description: item.description,
//               keywords: item.keywords.join(", "), // Сохраняем как строку
//             },
//           };
//         })
//       );

//       await index.upsert(records);

//       res.json({ message: "Данные добавлены", ids: records.map((r) => r.id) });
//     } catch (error) {
//       console.error("Ошибка при добавлении в Pinecone:", error);
//       res.status(500).json({ error: "Ошибка сервера" });
//     }
//   }
// }

// module.exports = new PineconeLarge();

const { Pinecone } = require("@pinecone-database/pinecone");
const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

class PineconeLarge {
  constructor() {
    this.addToPinecone = this.addToPinecone.bind(this);
    this.searchPinecone = this.searchPinecone.bind(this);
  }

  async embedText(text) {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: Array.isArray(text) ? text : [text],
    });

    if (!response.data || !response.data.length) {
      throw new Error("Ошибка при получении эмбеддинга");
    }

    return response.data.map((item) => item.embedding);
  }

  async searchPinecone(req, res) {
    try {
      const { query, topK = 5, author, title } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Не указан query для поиска" });
      }

      // 1. Векторизация запроса (query)
      const [queryVectorDesc, queryVectorKeywords] = await this.embedText([
        query,
        query,
      ]);

      // 2. Выполняем векторный поиск (берём topK = 100 для широты)
      const resultsDesc = await index.query({
        vector: queryVectorDesc,
        topK: 100,
        includeMetadata: true,
      });

      const resultsKeywords = await index.query({
        vector: queryVectorKeywords,
        topK: 100,
        includeMetadata: true,
      });

      // 3. Объединяем результаты (учитывая веса)
      const combinedResults = {};
      resultsDesc.matches.forEach((match) => {
        combinedResults[match.id] = {
          ...match.metadata,
          score: match.score,
          id: match.id,
        };
      });
      resultsKeywords.matches.forEach((match) => {
        if (combinedResults[match.id]) {
          combinedResults[match.id].score += match.score * 0.3;
        } else {
          combinedResults[match.id] = {
            ...match.metadata,
            score: match.score * 0.3,
            id: match.id,
          };
        }
      });

      // 4. Сортируем по убыванию score и оставляем topK
      let results = Object.values(combinedResults)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      // 5. Фильтрация по title и author (если указаны)
      if (author || title) {
        results = results.filter(
          (book) =>
            (author ? book.author === author : true) &&
            (title ? book.title === title : true)
        );
      }

      res.json(results);
    } catch (error) {
      console.error("Ошибка при поиске:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }

  async addToPinecone(req, res) {
    try {
      let { data } = req.body;

      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ error: "Отсутствуют данные" });
      }

      const records = await Promise.all(
        data.map(async (item) => {
          if (!item.description || !item.keywords) {
            throw new Error(
              "Отсутствует description или keywords у одного из объектов"
            );
          }

          const [vectorDescription, vectorKeywords] = await Promise.all([
            this.embedText(item.description),
            this.embedText(item.keywords.join(", ")),
          ]);

          const id = crypto
            .createHash("md5")
            .update(item.title + item.author)
            .digest("hex")
            .slice(0, 8);

          return {
            id,
            values: vectorDescription[0].map(
              (v, i) => v * 0.7 + vectorKeywords[0][i] * 0.3
            ),
            metadata: {
              title: item.title,
              author: item.author,
              year: item.year,
              description: item.description,
              keywords: item.keywords.join(", "),
            },
          };
        })
      );

      await index.upsert(records);

      res.json({ message: "Данные добавлены", ids: records.map((r) => r.id) });
    } catch (error) {
      console.error("Ошибка при добавлении в Pinecone:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }
}

module.exports = new PineconeLarge();
