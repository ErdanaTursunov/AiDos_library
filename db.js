const { Sequelize } = require("sequelize");

// Конфигурация подключения
const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USER,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    dialect: "postgres",
    port: 5432,
  }
);

module.exports = sequelize;
