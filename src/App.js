import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLightMode, setIsLightMode] = useState(
    localStorage.getItem("themeColor") === "light_mode"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Загружаем чаты из localStorage при первом рендере
  useEffect(() => {
    const savedChats = localStorage.getItem("savedChats");
    if (savedChats) {
      setChatHistory(JSON.parse(savedChats)); // Преобразуем строку в объект
      setShowSuggestions(false); // Если есть сохраненные чаты, скрываем предложения
    }
  }, []);

  // Сохраняем чаты в localStorage каждый раз, когда chatHistory изменяется
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("savedChats", JSON.stringify(chatHistory)); // Сохраняем как строку
    }
  }, [chatHistory]);

  useEffect(() => {
    document.body.classList.toggle("light_mode", isLightMode);
    localStorage.setItem(
      "themeColor",
      isLightMode ? "light_mode" : "dark_mode"
    );
  }, [isLightMode]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!userMessage.trim()) return;

    // Добавляем исходящее сообщение в чат
    const outgoingMessage = {
      content: userMessage,
      role: "user",
      type: "outgoing",
    };

    setChatHistory((prevChats) => {
      const updatedChats = [...prevChats, outgoingMessage];
      return updatedChats; // Обновляем историю сообщений
    });
    setUserMessage("");
    setShowSuggestions(false); // Скрыть предложения
    setIsLoading(true); // Показать анимацию загрузки

    // Получаем ответ от API
    const responseMessage = await fetchAPIResponse(userMessage);
    setChatHistory((prevChats) => [
      ...prevChats,
      { content: responseMessage, role: "assistant", type: "incoming" },
    ]);
    setIsLoading(false); // Скрыть анимацию загрузки
  };

  const fetchAPIResponse = async (userMessage) => {
    const API_URL =
      process.env.REACT_APP_API_URL || "http://localhost:4000/ai/chat"; // URL вашего бэкэнда
    const ticket = 567017; // Тикет, который вы хотите отправить

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage, // Отправляем сообщение
          ticket: ticket, // Отправляем тикет
        }),
      });

      const data = await res.json();

      console.log(data);
      if (res.ok) {
        return data?.message || "Ошибка: нет ответа."; // Обработка успешного ответа
      } else {
        return "Ошибка: не удалось получить ответ от сервера.";
      }
    } catch (error) {
      console.error("Ошибка при запросе:", error);
      return "Ошибка при запросе!";
    }
  };

  const fetchAPIreset = async () => {
    const API_URL =
      process.env.REACT_APP_API_URL || "http://localhost:4000/ai/chat"; // URL вашего бэкэнда

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reset: "true ", // Отправляем сообщение
        }),
      });

      const data = await res.json();

      console.log(data);
      if (res.ok) {
        return data?.message || "Ошибка: нет ответа.";
        // Обработка успешного ответа
      } else {
        return "Ошибка: не удалось получить ответ от сервера.";
      }
    } catch (error) {
      console.error("Ошибка при запросе:", error);
      return "Ошибка при запросе!";
    }
  };

  const handleDeleteAllMessages = async () => {
    await fetchAPIreset();

    setChatHistory([]);
    localStorage.removeItem("savedChats"); // Удаляем чаты из localStorage
    setShowSuggestions(true); // Показать предложения
  };

  const handleToggleTheme = () => {
    setIsLightMode((prev) => !prev);
  };

  const handleInsertText = (text) => {
    setUserMessage(text);
  };

  return (
    <div>
      <header className={`header ${showSuggestions ? "" : "hidden"}`}>
        <h2 className="title">Сәлеметсіз бе,</h2>
        <h4 className="subtitle">Сізге қандай көмек көрсете аламын?</h4>
      </header>

      {showSuggestions && (
        <ul className="suggestion-list">
          {[
            "Дипломдық жұмыс жазуға көмектесші",
            "Оқу залы қай жерде орналасқан?",
            "Диссертация жазуға көмектесші",
            'Маған "Богатый папа и бедный папа" кітабі керек еді',
          ].map((suggestion, index) => (
            <li
              className="suggestion"
              key={index}
              onClick={() => handleInsertText(suggestion)}
            >
              <h4 className="text">{suggestion}</h4>
              <span className="icon material-symbols-rounded">book</span>
            </li>
          ))}
        </ul>
      )}

      <div className="chat-list">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`message ${chat.type}`}>
            <div className="message-content">
              <img
                src={chat.type === "outgoing" ? "user.jpg" : "gemini.svg"}
                alt="Avatar"
                className="avatar"
              />
              <p className="text">{chat.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="loading-message">
            <p style={{ color: "white" }}>Идет загрузка</p>
          </div>
        )}
      </div>

      <div className="typing-area">
        <form onSubmit={handleSendMessage} className="typing-form">
          <div className="input-wrapper">
            <input
              id="typing-input"
              type="text"
              placeholder="Cұрағыңызды осы жерге енгізіңіз"
              className="typing-input"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              required
            />
            <button className="icon material-symbols-rounded">send</button>
          </div>
          <div className="action-buttons">
            <span
              onClick={handleDeleteAllMessages}
              className="icon material-symbols-rounded"
            >
              delete
            </span>
            <span
              onClick={handleToggleTheme}
              className="icon material-symbols-rounded"
            >
              {isLightMode ? "dark_mode" : "light_mode"}
            </span>
          </div>
        </form>
        <p className="disclaimer-text">
          Важно: Чат-бот помогает с общими вопросами. За точной информацией
          обращайтесь к библиотекарю.
        </p>
      </div>
    </div>
  );
};

export default App;
