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

async function getEmployeeDepartments(employeeId) {
  const empdepartment = await employeeDepartment.findAll({
    where: { employeeId },
  });

  for (i = 0; i < empdepartment.length; i++) {
    const department = await department.findOne({
      where: { id: empdepartment[i].departmentId },
    });
  }

  return department;
}

async function getEmployeeRoles(employeeId) {
  const empRole = await employeeRole.findAll({ where: { employeeId } });

  for (i = 0; i < empRole.length; i++) {
    const role = await role.findOne({ where: { id: empRole[i].roleId } });
  }
  return role;
}

async function getEmployeeDetails(employeeData) {
  const department = await getEmployeeDepartments(employeeData.id);
  const role = await getEmployeeRoles(employeeData.id);

  return {
    employees: employeeData,
    departments: department,
    roles: role,
  };
}

app.get("/employees", async (req, res) => {
  const response = await employee.findAll();

  const employeeDetails = [];
  for (i = 0; i < response.length; i++) {
    const detailedData = await getEmployeeDetails(response);
    employeeDetails.push(detailedData);
  }

  res.status(200).json(employeeDetails);
});

app.get("/departments", async (req, res) => {
  try {
    const response = await department.findAll();

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log("Express server initialized");
});
