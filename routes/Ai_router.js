const { Router } = require("express");
const LibraryAssistant = require("../Controllers/AI_controller/LibraryAssistant");
const ai_assistant = require("../Controllers/AI_controller/ai_assistant");

const Ai_router = new Router();

Ai_router.post("/", LibraryAssistant.askAssistant);
Ai_router.post("/chat", ai_assistant);

module.exports = Ai_router;
