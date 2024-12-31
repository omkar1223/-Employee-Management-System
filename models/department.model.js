let { Datatypes, sequelize } = require("../lib/index");

let department = sequelize.define("department", {
  name: {
    type: Datatypes.STRING,
    allowNull: false,
  },
});

module.exports = { department };
