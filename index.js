const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "employee_trackerDB",
});

// View all employees
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
                `
  const displayAll = [];
  connection.query(query, (err, res) => {
    res.forEach(({ id, first_name, last_name, title, department, salary, manager }) => {
      displayAll.push(
        {
          id: id,
          first_name: first_name,
          last_name: last_name,
          title: title,
          department: department,
          salary: salary,
          manager: manager
        }
      )
    });
    console.table(displayAll);
    whatToDo();
  });
}

// Sort by department
const printByDepartment = (answer, db) => {
  const byDepartment = [];
  const department = db.find( o => o.department === answer.department);
  const query = 
                "SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, CONCAT(m.first_name, ' ', m.last_name) as manager " +
                "FROM employee e "+
                "INNER JOIN role r "+
                "ON r.id = e.role_id "+
                "left JOIN department AS d "+
                "ON d.id = r.department_id "+
                "LEFT JOIN employee m "+
                "ON e.manager_id = m.id "+
                "WHERE d.id = ?";               ;
  connection.query(query, [department.id], (err, res) => {
    res.forEach(({ id, first_name, last_name, title, department, salary, manager }) => {
      byDepartment.push(
        {
          id: id,
          first_name: first_name,
          last_name: last_name,
          title: title,
          department: department,
          salary: salary,
          manager: manager
        }
      )
    });
    console.table(byDepartment);
    whatToDo();
  });
}

const viewByDepartment = () => {
  const query = `SELECT department.id id, department.name department FROM employee_trackerdb.department;`
  const db = [];
  connection.query(query, (err, res) => {
    res.forEach(({ id, department }) => {
      db.push(department);
    });
    console.log(db);

    inquirer
      .prompt(
        {
          type: "list",
          message: "Select a department?",
          choices: db,
          name: "department",
        }
      )
      .then((answer) => {
        printByDepartment(answer, res);
      });
  });
}

// Sort by managers
const printByManager = (answer, db) => {
  let query;
  const byManager = [];
  if (answer.manager === "Does not have a manager") answer.manager = null;
  const manager = db.find( o => o.manager === answer.manager);
  if (!manager.manager_id){
    query = 
            "SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, CONCAT(m.first_name, ' ', m.last_name) as manager "+
            "FROM employee e "+
            "INNER JOIN role r "+
            "ON r.id = e.role_id "+
            "LEFT JOIN department AS d "+
            "ON d.id = r.department_id "+
            "LEFT JOIN employee m "+
            "ON e.manager_id = m.id "+
            "WHERE e.manager_id IS NULL";
  }else{
    query = 
            "SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, CONCAT(m.first_name, ' ', m.last_name) as manager "+
            "FROM employee e "+
            "INNER JOIN role r "+
            "ON r.id = e.role_id "+
            "LEFT JOIN department AS d "+
            "ON d.id = r.department_id "+
            "LEFT JOIN employee m "+
            "ON e.manager_id = m.id "+
            "WHERE e.manager_id = ?";
  }
  connection.query(query, [manager.manager_id], (err, res) => {
    res.forEach(({ id, first_name, last_name, title, department, salary, manager }) => {
      byManager.push(
        {
          id: id,
          first_name: first_name,
          last_name: last_name,
          title: title,
          department: department,
          salary: salary,
          manager: manager
        }
      )
    });
    console.table(byManager);
    whatToDo();
  });              
}

const viewByManager = () => {
  const query = 
                "SELECT e.id, e.first_name, e.last_name, e.manager_id, CONCAT(m.first_name, ' ', m.last_name) as manager "+
                "FROM employee e "+
                "LEFT JOIN employee m "+
                "ON e.manager_id = m.id "+
                "GROUP BY e.manager_id";
  const managers = [];
  connection.query(query, (err, res) => {
    res.forEach(({ id, first_name, last_name, manager_id, manager }) => {
      if (manager != null) managers.push(manager);
    });
    managers.push("Does not have a manager");
    console.log(managers);

    inquirer
      .prompt(
        {
          type: "list",
          message: "Select the manager you want to filter for",
          choices: managers,
          name: "manager",
        }
      )
      .then((answer) => {
        printByManager(answer, res);
      });
  });
}

// 
const createNew = (elementName, tableName) =>{
  switch (tableName){
    case "department":
      const query = 'INSERT INTO ?? (name) values (?)';
      connection.query(query, [tableName, elementName], function (err, res) {
        console.log("Department added");
        // console.log(this.sql);
        whatToDo();
      });
      break;

    case "role":
      const query2 = 'SELECT * FROM department d';
      const departments = [];
      connection.query(query2, function (err, res) {
        res.forEach( ({id, name}) => {
          departments.push(name);
        })
        // console.log(departments);
        inquirer
          .prompt  ([
            {
              type: "list",
              message: "What department does this role belongs to",
              choices: departments,
              name: "belongsTo"
            },
            {
              type: "input",
              message: "Enter the salary for this role",
              name: "salary"
            }
          ])
          .then ((answer) => {
            const chosenDepartment = res.find( ({id, name}) => name === answer.belongsTo);
            // console.log(chosenDepartment);
            const query3 = 'INSERT INTO role (title, salary, department_id) values (?, ?, ?)';
            connection.query(query3, [elementName, answer.salary, chosenDepartment.id] ,function (err, res) {
              console.log(this.sql);
              console.log("Role added succesfully");
            });
            whatToDo();
          });
        
      });
      break;

    case "employee":
      const query4 = 'SELECT r.id, r.title FROM role r';
      const roles = [];
      connection.query(query4, function (err, res) {
        res.forEach( ({id, title}) => {
          roles.push(title);
        });
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
            }
          ])
          .then((answer) => {
            const query5 = 'INSERT INTO employee (first_name, last_name, role_id) values (?, ?, ?)';
            const roleInfo = res.find( ({id, title}) => title === answer.role);
            connection.query(query5, [answer.firstName, answer.lastName, roleInfo.id], function (err, res) {
              console.log(this.sql);
              console.log("Added a new employee");
              whatToDo();
            });
          });
        });
      break;
  }
}

// 
const isNew = (elementName, tableName) => {
  const query = 'Select * FROM ?? WHERE ?? = ?';
  let columnName;
  switch (tableName){
    case "department":
      columnName = "name";
      break;
    case "role":
      columnName = "title";
      break;
  }
  connection.query(query, [tableName, columnName, elementName], function (err, res) {
    // console.log(res);
    // console.log(this.sql);
    if (res.length > 0){
      console.log ("That " + tableName + " already exists");
      whatToDo();
    }else{
      createNew(elementName, tableName);
    }
  });
}

// Add Department
const getNewDepartment = () => {
  inquirer
    .prompt(
      {
        type: "input",
        message: "Enter the new department's name?",
        name: "departmentName",
      }
    )
    .then((answer) => {
      isNew(answer.departmentName, "department");
    });
}

// 
const getNewRole = () =>{
  inquirer
    .prompt(
      {
        type: "input",
        message: "Enter the new role's name?",
        name: "roleName",
      }
    )
  .then((answer) => {
    isNew(answer.roleName, "role");
  });
}

// Starting question
const whatToDo = () => {
  inquirer
    .prompt(
      {
        type: "list",
        message: "What would you like to do?",
        choices: ['View All Employees', 'View All Employees by Department'
                  ,'View All Employees By Manager', 'Add Department', 'Add Role'
                  ,'Add Employee', 'View Departments', 'View Roles', 'Update Employee Role'],
        name: "whatToDo",
      }
    )
    .then((answer) => {
      if (answer.whatToDo === 'View All Employees'){
        viewAllEmployees();
      }else if (answer.whatToDo === 'View All Employees by Department'){
        viewByDepartment();
      }else if (answer.whatToDo === 'View All Employees By Manager'){
        viewByManager();
      }else if(answer.whatToDo === 'Add Department'){
        getNewDepartment();
      }else if(answer.whatToDo === 'Add Role'){
        getNewRole();
      }else if(answer.whatToDo === 'Add Employee'){
        createNew('','employee');
      }
    });
};


connection.connect((err) => {
  if (err) throw err;
  whatToDo();
});


