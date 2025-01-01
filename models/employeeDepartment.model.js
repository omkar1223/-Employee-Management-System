let { Datatypes, sequelize } = require("../lib/index");
let { employee } = require("./employee.model");
let { department } = require("./department.model");

let employeeDepartment = sequelize.define("employeeDepartment", {
  employeeId: {
    type: Datatypes.INTEGER,
    references: {
      model: employee,
      key: "id",
    },
    departmentId: {
      type: Datatypes.INTEGER,
      references: {
        model: department,
        key: "id",
      },
    },
  },
});

employee.belongsToMany(department, { through: employeeDepartment });
department.belongsToMany(employee, { through: employeeDepartment });

module.exports = { employeeDepartment };
