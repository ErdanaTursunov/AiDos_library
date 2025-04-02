const axios = require("axios");
const Chat = require("../../models/Chat");

async function ai_assistant(req, res) {
  try {
    const { ticket, message } = req.body;

    if (!ticket || !message) {
      return res
        .status(400)
        .json({ message: "Пожалуйста, укажите userId и сообщение." });
    }

    let chat = await Chat.findOne({ where: { userId: ticket } });
    if (!chat) {
      chat = await Chat.create({
        userId: ticket,
        messages: JSON.stringify([]),
      });
    }

    let chatHistory = JSON.parse(chat.messages);
    let assistantMessage = "";

    const response = await axios.post("http://localhost:4000/ai", {
      message: message,
      userId: ticket,
    });
    console.log("Ответ LibraryAssistant:", response.data);

    const books = Array.isArray(response.data.books) ? response.data.books : [];
    const libraryReply = response.data.reply || "";

    if (books.length === 0) {
      const openAiResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [...chatHistory, { role: "user", content: message }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      assistantMessage =
        openAiResponse.data?.choices?.[0]?.message?.content ||
        "Извините, я не нашёл книги по вашему запросу. Может, попробовать сформулировать запрос иначе?";
    } else {
      assistantMessage = generateUserFriendlyResponse(libraryReply, books);
    }

    chatHistory.push({ role: "user", content: message });
    chatHistory.push({ role: "assistant", content: assistantMessage });
    chat.messages = JSON.stringify(chatHistory);
    await chat.save();

    return res.json({ message: assistantMessage });
  } catch (error) {
    console.error("Ошибка в ai_assistant:", error);
    return res
      .status(500)
      .json({ message: "Произошла ошибка. Попробуйте позже." });
  }
}

function generateUserFriendlyResponse(reply, books) {
  let responseText = "Вот что я нашёл по вашему запросу:\n\n" + reply + "\n\n";
  books.forEach((book, index) => {
    const title = book.TITLE
      ? book.TITLE.replace(/^['"]|['"]$/g, "").trim()
      : "Название неизвестно";
    const author = book.AUTHOR
      ? book.AUTHOR.replace(/^['"]|['"]$/g, "").trim()
      : "Автор неизвестен";
    responseText += `${index + 1}. *${title}* – ${author}\n\n`;
  });
  responseText +=
    "Если вам нужна дополнительная информация, пожалуйста, уточните запрос!";
  return responseText;
}

module.exports = ai_assistant;

