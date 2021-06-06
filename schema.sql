DROP DATABASE IF EXISTS employee_trackerDB;

CREATE DATABASE employee_trackerDB;

USE employee_trackerDB;

CREATE TABLE department(
	department_id INT NOT NULL AUTO_INCREMENT,    
    name VARCHAR (30) NOT NULL,
	PRIMARY KEY (department_id)
);

CREATE TABLE role(
	role_id INT NOT NULL AUTO_INCREMENT,
	title VARCHAR (30) NOT NULL,
	salary DECIMAL (10,4) NOT NULL,
    department_id INT(10) NOT NULL,
    PRIMARY KEY (role_id),
    FOREIGN KEY (department_id) REFERENCES department (department_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE employee(
	employee_id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR (30) NOT NULL,
    last_name VARCHAR (30) NOT NULL,
    role_id INT (10) NOT NULL,
    manager_id INT (10) DEFAULT NULL,
    PRIMARY KEY (employee_id),
    FOREIGN KEY (role_id) REFERENCES role (role_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES employee (employee_id) ON UPDATE CASCADE ON DELETE CASCADE
);