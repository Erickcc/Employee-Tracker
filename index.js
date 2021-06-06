const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'employee_trackerDB',
});

connection.connect((err) => {
    if (err) throw err;
    whatToDo();
  });

  const whatToDo = () => {

  }