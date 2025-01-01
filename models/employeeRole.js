let { Datatypes, sequelize } = require("../lib/index");
let { employee } = require("./employee.model");
let { role } = require("./role.model");

let employeeRole = sequelize.define("employeeRole", {
  employeeId: {
    type: Datatypes.INTEGER,
    references: {
      model: employee,
      key: "id",
    },
    roleId: {
      type: Datatypes.INTEGER,
      references: {
        model: role,
        key: "id",
      },
    },
  },
});

employee.belongsToMany(role, { through: employeeRole });
role.belongsToMany(employee, { through: employeeRole });

module.exports = { employeeRole };
