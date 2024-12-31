let { Datatypes, sequelize } = require("../lib/index");

let role = sequelize.define("role", {
  title: {
    type: Datatypes.STRING,
    allowNull: false,
  },
});

module.exports = { role };
