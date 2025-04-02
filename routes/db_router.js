const { Router } = require("express");
const BookController = require("../Controllers/db_controller/BookController");

const db_router = new Router();

db_router.post("/search", BookController.searchBooks);

module.exports = db_router;
