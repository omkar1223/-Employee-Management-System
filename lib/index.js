let sq = require("sequelize");

let sequelize = new sq.Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});

module.exports = { Datatypes: sq.DataTypes, sequelize };
