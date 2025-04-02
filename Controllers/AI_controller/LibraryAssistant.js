const axios = require("axios");
const Chat = require("../../models/Chat");
require("dotenv").config();

class LibraryAssistant {
  static async askAssistant(req, res) {
    try {
      const { userId, message } = req.body;

      if (!userId || !message) {
        return res.status(400).json({ error: "Требуется userId и message" });
      }

      const systemPrompt = `
Ты библиотекарь. Разбери запрос пользователя и верни JSON:
{ "title": "...", "author": "...", "description": "..." }

Правила:
- **title** → если указано точное название книги.
- **author** → если пользователь **сам написал автора** (НЕ придумывай его!).
- **description** → ключевое слово или фраза для поиска по смыслу.

❗ В **description** должен быть **ТОЛЬКО один основной keyword** из запроса.  
❗ НЕ пиши длинные фразы, выбирай **ключевую тему** (пример: "вокальные произведения").
❗ Если в запросе явно указано название книги или автор, то их нужно указать в **title** и **author**.
`;

      // 🔹 Получаем историю сообщений пользователя
      let chat = await Chat.findOne({ where: { userId } });
      if (!chat) {
        chat = await Chat.create({ userId, messages: JSON.stringify([]) });
      }

      let chatHistory = JSON.parse(chat.messages);
      chatHistory = chatHistory.slice(-5); // Берем последние 5 сообщений

      // 🔹 Отправляем запрос в OpenAI с историей сообщений
      const openAiResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...chatHistory,
            { role: "user", content: message }
          ],
          temperature: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      let extractedData =
        openAiResponse.data?.choices?.[0]?.message?.content || "{}";
      extractedData = extractedData.replace(/```json|```/g, "").trim();
      const extractedJson = JSON.parse(extractedData);

      console.log("Извлеченные данные:", extractedJson);

      // 🔹 Отправляем запрос в `localhost:4000/db/search`
      const searchResponse = await axios.post("http://localhost:4000/db/search", {
        title: extractedJson.title || "",
        author: extractedJson.author || "",
        description: extractedJson.description || ""
      });

      // 🔹 Добавляем новое сообщение в историю
      chatHistory.push({ role: "user", content: message });
      chatHistory.push({ role: "assistant", content: JSON.stringify(searchResponse.data.books) });

      chat.messages = JSON.stringify(chatHistory);
      await chat.save();

      return res.json({
        books: searchResponse.data.books
      });
    } catch (error) {
      console.error("Ошибка в LibraryAssistant:", error.response?.data || error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }
}

module.exports = LibraryAssistant;
