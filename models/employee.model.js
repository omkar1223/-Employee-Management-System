let { Datatypes, sequelize } = require("../lib/index");

let employee = sequelize.define("employee", {
  name: {
    type: Datatypes.STRING,
    allowNull: false,
  },
  email: {
    type: Datatypes.TEXT,
    validate: {
      isEmail: true,
    },
    allowNull: false,
  },
});

module.exports = { employee };
