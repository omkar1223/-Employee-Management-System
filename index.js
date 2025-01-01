const express = require("express");
const { resolve } = require("path");
let { role } = require("./models/role.model");
let { department } = require("./models/department.model");
let { employee } = require("./models/employee.model");
let { sequelize } = require("./lib/index");
let { employeeDepartment } = require("./models/employeeDepartment.model");
let { employeeRole } = require("./models/employeeRole.model");
const port = 3000;
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use(express.static("static"));

app.get("/seed_db", async (req, res) => {
  await sequelize.sync({ force: true });

  const departments = await department.bulkCreate([
    { name: "Engineering" },
    { name: "Marketing" },
  ]);

  const roles = await role.bulkCreate([
    { title: "Software Engineer" },
    { title: "Marketing Specialist" },
    { title: "Product Manager" },
  ]);

  const employees = await employee.bulkCreate([
    { name: "Rahul Sharma", email: "rahul.sharma@example.com" },
    { name: "Priya Singh", email: "priya.singh@example.com" },
    { name: "Ankit Verma", email: "ankit.verma@example.com" },
  ]);

  // Associate employees with departments and roles using create method on junction models

  await employeeDepartment.create({
    employeeId: employees[0].id,
    departmentId: departments[0].id,
  });
  await employeeRole.create({
    employeeId: employees[0].id,
    roleId: roles[0].id,
  });

  await employeeDepartment.create({
    employeeId: employees[1].id,
    departmentId: departments[1].id,
  });
  await employeeRole.create({
    employeeId: employees[1].id,
    roleId: roles[1].id,
  });

  await employeeDepartment.create({
    employeeId: employees[2].id,
    departmentId: departments[0].id,
  });
  await employeeRole.create({
    employeeId: employees[2].id,
    roleId: roles[2].id,
  });

  return res.json({ message: "Database seeded!" });
});

app.get("/employees", async (req, res) => {
  const response = await employee.findAll();
  res.status(200).json({ employees: response });
});

app.get("/departments", async (req, res) => {
  const response = await department.findAll();
  res.status(200).json({ departments: response });
});

app.listen(port, () => {
  console.log("Express server initialized");
});
