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

  let departmentData;
  for (let i = 0; i < empdepartment.length; i++) {
    departmentData = await department.findOne({
      where: { id: empdepartment[i].departmentId },
    });
  }

  return departmentData;
}

async function getEmployeeRoles(employeeId) {
  const empRole = await employeeRole.findAll({ where: { employeeId } });

  let roleData;
  for (let i = 0; i < empRole.length; i++) {
    roleData = await role.findOne({ where: { id: empRole[i].roleId } });
  }
  return roleData;
}

async function getEmployeeDetails(employeeData) {
  const department = await getEmployeeDepartments(employeeData.id);
  const role = await getEmployeeRoles(employeeData.id);

  return {
    ...employeeData.dataValues,
    department: department,
    role: role,
  };
}

app.get("/employees", async (req, res) => {
  try {
    const response = await employee.findAll();

    const employeeDetails = [];

    for (let i = 0; i < response.length; i++) {
      let detailedData = await getEmployeeDetails(response[i]);
      employeeDetails.push(detailedData);
    }

    return res.json({ employees: employeeDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/departments", async (req, res) => {
  try {
    const response = await department.findAll();

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/employees/details/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const response = await employee.findOne({ where: { id } });
    const empDetailed = await getEmployeeDetails(response);
    res.status(200).json({ employee: empDetailed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/roles", async (req, res) => {
  const response = await role.findAll();
  res.status(200).json({ roles: response });
});

app.get("/employees/department/:departmentId", async (req, res) => {
  const departmentId = parseInt(req.params.departmentId);
  try {
    const response = await employeeDepartment.findAll({
      where: { departmentId },
    });

    let detailedData = [];
    for (let i = 0; i < response.length; i++) {
      let data = await employee.findOne({
        where: { id: response[i].employeeId },
      });
      let fetch = await getEmployeeDetails(data);
      detailedData.push(fetch);
    }

    return res.status(200).json({ employees: detailedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/employees/role/:roleId", async (req, res) => {
  const roleId = parseInt(req.params.roleId);
  try {
    const response = await employeeRole.findAll({ where: { roleId } });

    let detailedData = [];
    for (let i = 0; i < response.length; i++) {
      let data = await employee.findOne({
        where: { id: response[i].employeeId },
      });
      let fetch = await getEmployeeDetails(data);
      detailedData.push(fetch);
    }
    res.status(200).json({ employees: detailedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/employees/sort-by-name", async (req, res) => {
  const order = req.query.order;
  try {
    const response = await employee.findAll({ order: [["name", order]] });
    let detailedDataSorted = [];
    for (let i = 0; i < response.length; i++) {
      let data = await getEmployeeDetails(response[i]);
      detailedDataSorted.push(data);
    }
    res.status(200).json({ employees: detailedDataSorted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function addEmpNewUser(newUser) {
  const addNew = await employee.create({
    name: newUser.name,
    email: newUser.email,
  });

  await employeeDepartment.create({
    employeeId: addNew.id,
    departmentId: newUser.departmentId,
  });

  await employeeRole.create({
    employeeId: addNew.id,
    roleId: newUser.roleId,
  });

  return { message: "New User Added", addNew };
}

app.post("/employee/new", async (req, res) => {
  const newUser = req.body;
  try {
    const response = await addEmpNewUser(newUser);
    const detailedNewData = await getEmployeeDetails(response.addNew);
    res.status(200).json(detailedNewData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log("Express server initialized");
});
