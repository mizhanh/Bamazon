DROP DATABASE IF EXISTS bamazon_DB;
CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products(
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(50) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price decimal(10,2) default 0,
  stock_quantity INT default 0,
  product_sales decimal(20,2) default 0,
  PRIMARY KEY (item_id)
);

CREATE TABLE departments(
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(45) NOT NULL,
  over_head_costs decimal(10) default 0,
  PRIMARY KEY (department_id)
);

CREATE VIEW departmentSales AS
  SELECT
    department_name AS dept_name,
        sum(product_sales) AS product_sales
  FROM
    products
  GROUP BY department_name;
      

 CREATE VIEW totalProfits AS
  SELECT 
    department_id, 
        department_name, 
        over_head_costs,
        product_sales
  FROM departments a, departmentSales b
    WHERE department_name = dept_name;
    
