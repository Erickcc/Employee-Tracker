const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

// Set mysql server connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "employee_trackerDB",
});

/* View all employees with the following information
- First Name
- Last Name
- Title
- Department
- Salary
- Manager
*/

const viewAllEmployees = () => {
  const query = `
                SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, CONCAT(m.first_name, ' ', m.last_name) as manager
                FROM employee e
                INNER JOIN role r
                ON r.id = e.role_id
                left JOIN department AS d
                ON d.id = r.department_id
                LEFT JOIN employee m
                ON e.manager_id = m.id
                ;
                `;
  const displayAll = [];
  connection.query(query, (err, res) => {
    // Build an array of objects with all the employee information
    res.forEach(
      ({ id, first_name, last_name, title, department, salary, manager }) => {
        displayAll.push({
          id: id,
          first_name: first_name,
          last_name: last_name,
          title: title,
          department: department,
          salary: salary,
          manager: manager,
        });
      }
    );
    // Print the table with the console table dependency
    console.table(displayAll);
    // Go back to the main function
    whatToDo();
  });
};

/* Print the following information for the chosen department1
- First Name
- Last Name
- Title
- Department
- Salary
- Manager
*/
const printByDepartment = (answer, db) => {
  const byDepartment = [];
  // Once we have the department that we want to display, find the complete information of that department in the database array of objects
  // to obtain the id of said department
  const department = db.find((o) => o.department === answer.department);
  const query =
    "SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, CONCAT(m.first_name, ' ', m.last_name) as manager " +
    "FROM employee e " +
    "INNER JOIN role r " +
    "ON r.id = e.role_id " +
    "left JOIN department AS d " +
    "ON d.id = r.department_id " +
    "LEFT JOIN employee m " +
    "ON e.manager_id = m.id " +
    "WHERE d.id = ?";
  connection.query(query, [department.id], (err, res) => {
    // Create an array of objects with the desired information
    res.forEach(
      ({ id, first_name, last_name, title, department, salary, manager }) => {
        byDepartment.push({
          id: id,
          first_name: first_name,
          last_name: last_name,
          title: title,
          department: department,
          salary: salary,
          manager: manager,
        });
      }
    );
    // Print  the table with the console table dependency
    console.table(byDepartment);
    // Go back to the main function
    whatToDo();
  });
};

// Find out which department the user wants to filter by
const viewByDepartment = () => {
  // Get the ID and name of all the departments
  const query = `SELECT department.id id, department.name department FROM employee_trackerdb.department;`;
  const db = [];
  connection.query(query, (err, res) => {
    // save the department names in the db variable to use it in the inquirer
    res.forEach(({ id, department }) => {
      db.push(department);
    });
    // console.log(db);

    inquirer
      .prompt({
        type: "list",
        message: "Select a department?",
        choices: db,
        name: "department",
      })
      .then((answer) => {
        // Print the information of the desired department
        printByDepartment(answer, res);
      });
  });
};

/* Print the following information for the employees with the chosen manager
- First Name
- Last Name
- Title
- Department
- Salary
- Manager
*/
const printByManager = (answer, db) => {
  // Build a query based on wheter we want employees with a specific manager or no manager
  let query;
  const byManager = [];
  if (answer.manager === "Does not have a manager") answer.manager = null;
  // Find all the information of the chosen manager so that we can get the id of the desired manager and filter for it
  const manager = db.find((o) => o.manager === answer.manager);
  // Search for the employees that dont have a manager
  if (!manager.manager_id) {
    query =
      "SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, CONCAT(m.first_name, ' ', m.last_name) as manager " +
      "FROM employee e " +
      "INNER JOIN role r " +
      "ON r.id = e.role_id " +
      "LEFT JOIN department AS d " +
      "ON d.id = r.department_id " +
      "LEFT JOIN employee m " +
      "ON e.manager_id = m.id " +
      "WHERE e.manager_id IS NULL";
  } else {
    // Search for the employees that have an specific manager
    query =
      "SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, CONCAT(m.first_name, ' ', m.last_name) as manager " +
      "FROM employee e " +
      "INNER JOIN role r " +
      "ON r.id = e.role_id " +
      "LEFT JOIN department AS d " +
      "ON d.id = r.department_id " +
      "LEFT JOIN employee m " +
      "ON e.manager_id = m.id " +
      "WHERE e.manager_id = ?";
  }
  connection.query(query, [manager.manager_id], (err, res) => {
    // Build the byManager array with the data obtained through the query
    res.forEach(
      ({ id, first_name, last_name, title, department, salary, manager }) => {
        byManager.push({
          id: id,
          first_name: first_name,
          last_name: last_name,
          title: title,
          department: department,
          salary: salary,
          manager: manager,
        });
      }
    );
    // Print the information with the console table dependency
    console.table(byManager);
    // Go back to the main menu
    whatToDo();
  });
};

// Obtain which manager we want to filter by
const viewByManager = () => {
  const query =
    "SELECT e.id, e.first_name, e.last_name, e.manager_id, CONCAT(m.first_name, ' ', m.last_name) as manager " +
    "FROM employee e " +
    "LEFT JOIN employee m " +
    "ON e.manager_id = m.id " +
    "GROUP BY e.manager_id";
  const managers = [];
  connection.query(query, (err, res) => {
    // Get all the manager names and add a "Does not have a manager" option at the end
    res.forEach(({ id, first_name, last_name, manager_id, manager }) => {
      if (manager != null) managers.push(manager);
    });
    managers.push("Does not have a manager");
    // console.log(managers);

    inquirer
      .prompt({
        type: "list",
        message: "Select the manager you want to filter for",
        choices: managers,
        name: "manager",
      })
      .then((answer) => {
        // Filter and display the information for the desired manager
        printByManager(answer, res);
      });
  });
};

// Create a new department, role or employee
const createNew = (elementName, tableName) => {
  switch (tableName) {
    // For departments
    case "department":
      // Create a new department with the inputted name
      const query = "INSERT INTO ?? (name) values (?)";
      connection.query(query, [tableName, elementName], function (err, res) {
        console.log("Department added");
        // console.log(this.sql);
        whatToDo();
      });
      break;
    // For roles
    case "role":
      const query2 = "SELECT * FROM department d";
      const departments = [];
      // Get all departments and ask the user to what department this role belongs to
      connection.query(query2, function (err, res) {
        res.forEach(({ id, name }) => {
          departments.push(name);
        });
        // console.log(departments);
        inquirer
          .prompt([
            {
              type: "list",
              message: "What department does this role belongs to",
              choices: departments,
              name: "belongsTo",
            },
            {
              type: "input",
              message: "Enter the salary for this role",
              name: "salary",
            },
          ])
          .then((answer) => {
            // Find the id of the chosen department
            const chosenDepartment = res.find(
              ({ id, name }) => name === answer.belongsTo
            );
            // console.log(chosenDepartment);
            // Inser a new role with all the information the user inputted
            const query3 =
              "INSERT INTO role (title, salary, department_id) values (?, ?, ?)";
            connection.query(
              query3,
              [elementName, answer.salary, chosenDepartment.id],
              function (err, res) {
                console.log(this.sql);
                console.log("Role added succesfully");
              }
            );
            // Go back to the main menu
            whatToDo();
          });
      });
      break;

    case "employee":
      // Get all the information of the roles table
      const query4 = "SELECT r.id, r.title FROM role r";
      const roles = [];
      connection.query(query4, function (err, resRoles) {
        resRoles.forEach(({ id, title }) => {
          roles.push(title);
        });
        const query5 =
          // Get the id and the complete name of all employees, this will allow us to chose a manager based on the existing employees
          "SELECT e.id, CONCAT(e_name.first_name, ' ' , e_name.last_name) as employees " +
          "FROM employee e " +
          "LEFT JOIN employee e_name " +
          "ON e.id = e_name.id " +
          "ORDER BY e.id ASC";
        const managers = [];
        connection.query(query5, function (err, resEmployees) {
          resEmployees.forEach(({ id, employees }) => {
            managers.push(employees);
          });
          // Ask the user the first name, last name, role and manager of the new employee
          inquirer
            .prompt([
              {
                type: "input",
                message: "What is the employee's first name?",
                name: "firstName",
              },
              {
                type: "input",
                message: "What is the employee's last name?",
                name: "lastName",
              },
              {
                type: "list",
                message: "What is the employee's role",
                choices: roles,
                name: "role",
              },
              {
                type: "list",
                message: "Select the employee's manager",
                choices: managers,
                name: "chosenManager",
              },
            ])
            .then((answer) => {
              // Query to add a new employee
              const query6 =
                "INSERT INTO employee (first_name, last_name, role_id, manager_id) values (?, ?, ?, ?)";
              // Find the id of the chosen manager
              const manager = resEmployees.find(
                ({ id, employees }) => employees === answer.chosenManager
              );
              // Find the id of the chosen role
              const roleInfo = resRoles.find(
                ({ id, title }) => title === answer.role
              );
              connection.query(
                query6,
                [answer.firstName, answer.lastName, roleInfo.id, manager.id],
                function (err, res) {
                  // console.log(this.sql);
                  console.log("Added a new employee");
                  whatToDo();
                }
              );
            });
        });
      });
      break;
  }
};

// Validate if the role or department is new, if it already exists go back to the main menu
const isNew = (elementName, tableName) => {
  const query = "Select * FROM ?? WHERE ?? = ?";
  let columnName;
  // If we are looking for departments, look for the column named "name" in the departments table
  // If we are looking for roles, look for the column named "title" in the roles table
  switch (tableName) {
    case "department":
      columnName = "name";
      break;
    case "role":
      columnName = "title";
      break;
  }
  connection.query(
    query,
    [tableName, columnName, elementName],
    function (err, res) {
      // console.log(res);
      // console.log(this.sql);
      // Table exists, display a message and go back to the main menu
      if (res.length > 0) {
        console.log("That " + tableName + " already exists");
        whatToDo();
      } else {
        // Create new element of the desired type
        createNew(elementName, tableName);
      }
    }
  );
};

// Get the name of the desired department
const getNewDepartment = () => {
  inquirer
    .prompt({
      type: "input",
      message: "Enter the new department's name?",
      name: "departmentName",
    })
    .then((answer) => {
      // Validate if the department is new
      isNew(answer.departmentName, "department");
    });
};

// Get the name of the desired role
const getNewRole = () => {
  inquirer
    .prompt({
      type: "input",
      message: "Enter the new role's name?",
      name: "roleName",
    })
    .then((answer) => {
      // Validate if the role is new
      isNew(answer.roleName, "role");
    });
};

// Print the complete departments table
const viewDepartments = () => {
  const query = "SELECT department.name as Departments FROM department";
  connection.query(query, function (err, res) {
    console.table(res);
    whatToDo();
  });
};

// Print the complete roles table
const viewRoles = () => {
  const query = "SELECT role.title as Roles FROM role";
  connection.query(query, function (err, res) {
    console.table(res);
    whatToDo();
  });
};

// Update the role of a single employee
const updateRole = () => {
  // Obtain the id and complete name of all the employees from the database
  const query =
    "SELECT e.id, CONCAT(m.first_name, ' ', m.last_name) as employee " +
    "FROM employee e " +
    "LEFT JOIN employee m " +
    "ON e.id = m.id";
  const employees = [];
  connection.query(query, function (err, employeeT) {
    // Build an array with the employees names to use it as options in the inquirer
    employeeT.forEach(({ id, employee }) => {
      employees.push(employee);
    });
    inquirer
      .prompt({
        type: "list",
        message: "Whose role do you want to update?",
        choices: employees,
        name: "employee",
      })
      .then((employeeQ) => {
        // Obtain all the roles from the database
        const query2 = "SELECT id, title FROM role;";
        const roles = [];
        connection.query(query2, function (err, roleT) {
          // Build an array with just the roles to use it in inquirer
          roleT.forEach(({ id, title }) => {
            roles.push(title);
          });
          inquirer
            .prompt({
              type: "list",
              message: "Select the new role?",
              choices: roles,
              name: "role",
            })
            .then((roleQ) => {
              // Find the role id the desired employee
              const chosenRole = roleT.find(
                ({ id, title }) => title === roleQ.role
              );
              // Find the employee id of the desired employee
              const chosenEmployee = employeeT.find(
                ({ id, employee }) => employee === employeeQ.employee
              );
              // console.log(chosenRole);
              // console.log(chosenEmployee);
              // Update the role for the desired employee
              const query3 = "UPDATE employee SET role_id = ? WHERE id = ?";
              connection.query(
                query3,
                [chosenRole.id, chosenEmployee.id],
                function (err, roleT) {
                  console.log("Updated Role succesfully");
                  whatToDo();
                }
              );
            });
        });
      });
  });
};

// Starting questions, ask the user what he wants to do
const whatToDo = () => {
  inquirer
    .prompt({
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "View All Employees by Department",
        "View All Employees By Manager",
        "Add Department",
        "Add Role",
        "Add Employee",
        "View Departments",
        "View Roles",
        "Update Employee Role",
      ],
      name: "whatToDo",
    })
    .then((answer) => {
      if (answer.whatToDo === "View All Employees") {
        viewAllEmployees();
      } else if (answer.whatToDo === "View All Employees by Department") {
        viewByDepartment();
      } else if (answer.whatToDo === "View All Employees By Manager") {
        viewByManager();
      } else if (answer.whatToDo === "Add Department") {
        getNewDepartment();
      } else if (answer.whatToDo === "Add Role") {
        getNewRole();
      } else if (answer.whatToDo === "Add Employee") {
        createNew("", "employee");
      } else if (answer.whatToDo === "View Departments") {
        viewDepartments();
      } else if (answer.whatToDo === "View Roles") {
        viewRoles();
      } else if (answer.whatToDo === "Update Employee Role") {
        updateRole();
      }
    });
};

// Start the connection with the database and go to the main menu
connection.connect((err) => {
  if (err) throw err;
  whatToDo();
});
