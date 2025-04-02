require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sequelize = require("./db");
const db_router = require("./routes/db_router");
const Ai_router = require("./routes/Ai_router");

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.json());


app.use("/ai", Ai_router);

app.use("/db", db_router)

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Успешно соединен с базой данных");

    // await sequelize.sync({ alter: true });
    // console.log("✅ База данных синхронизирована!");

    app.listen(PORT, () => {
      console.log(`Сервер работает на порту ${PORT}`);
    });
  } catch (e) {
    console.log("Error starting server:", e);
  }
};

start();
