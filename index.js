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


// Starting question
const whatToDo = () => {
  inquirer
    .prompt(
      {
        type: "list",
        message: "What would you like to do?",
        choices: ['View All Employees', 'View All Employees by Department'
                  ,'View All Employees By Manager', 'Add Employee', 'Update Employee Role'
                  ,'Update Employee Manager'],
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
      }
    });
};


connection.connect((err) => {
  if (err) throw err;
  whatToDo();
});


