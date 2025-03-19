require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const WeaviateRouter = require("./routes/WeaviateRouter");

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.json());

app.use("/weaviate", WeaviateRouter);

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Сервер работает на порту ${PORT}`);
    });
  } catch (e) {
    console.log("Error starting server:", e);
  }
};

start();
