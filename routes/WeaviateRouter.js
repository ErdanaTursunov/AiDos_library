const Router = require("express");
const Weaviatebookcreate = require("../Controllers/Weaviatebookcreate");
const LibraryAssistant = require("../Controllers/LibraryAssistant");
const WeaviateRouter = new Router();

WeaviateRouter.post("/search/book", Weaviatebookcreate.searchBooks);
WeaviateRouter.post("/add-book", Weaviatebookcreate.AddBook);


WeaviateRouter.post("/ai", LibraryAssistant.processUserQuery);


module.exports = WeaviateRouter;
