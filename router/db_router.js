const { Router } = require("express");
const BookController = require("../controller/BookController");
const ChatController = require("../controller/ChatController");

const db_router = new Router();

db_router.post("/search", BookController.searchBooks);
db_router.post("/chat", ChatController.chat);
db_router.post("/chat/clear", ChatController.clearChat);

module.exports = db_router;
