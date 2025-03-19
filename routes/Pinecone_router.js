const Router = require("express");
const Pinecone_router = new Router();
const LibraryAssistant = require("../Controllers/LibraryAssistant");
const pinecone_large = require("../Controllers/pinecone_large");
const PineconeLarge = require("../Controllers/PineconeLarge");

Pinecone_router.post("/search", pinecone_large.searchPinecone);
Pinecone_router.post("/add", pinecone_large.addToPinecone);



Pinecone_router.post("/searchPinecone", PineconeLarge.searchPinecone);
Pinecone_router.post("/addToPinecone", PineconeLarge.addToPinecone);

Pinecone_router.post("/ai", LibraryAssistant.processUserQuery);

module.exports = Pinecone_router;
