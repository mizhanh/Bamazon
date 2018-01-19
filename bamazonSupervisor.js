var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk");
var Table = require("cli-table");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_DB"
});

supervisorOptions();

function supervisorOptions() {
    inquirer.prompt([{
            name: "option",
            type: "rawlist",
            message: "What would you like to do?",
            choices: ["View Product Sales By Department", "Create New Department",]
        }]).then(function(answer) {
            if (answer.option == "View Product Sales By Department") {
            	productSales();
            	
            } else {
        		createDept();
        		
        	}
	})
};

function productSales(){
	var table = new Table({
		head: ['DeptID', 'Dept Name', 'Overhead Costs', 'Product Sales', 'Total Profit'],
		colWidths: [10, 15, 15, 15, 15]});

	console.log(chalk.blue.bold("\nProduct Sales By Department: "));

  	connection.query("SELECT * FROM totalProfits", function(err, results) {
      		if (err) throw err;
      		for (var i=0; i<results.length; i++) {
        		var profit = results[i].product_sales - results[i].over_head_costs;
      			table.push(
				[results[i].department_id, results[i].department_name, results[i].over_head_costs, results[i].product_sales, profit]
				);
      		}
			console.log(table.toString());
  			
  			connection.end();
	})
	
}


function createDept(){
  connection.query("SELECT * FROM departments", function(err, results){
    if (err) throw err;
    inquirer.prompt([
      { name: "departmentName",
        type: "input",
        message: "What is the department name?"
      },{
        name: "overheadCost",
        type: "input",
        message: "What is the department overhead cost?"
      
    }]).then(function(answer){
      connection.query("INSERT INTO departments SET ?",
        { department_name: answer.departmentName,
          over_head_costs: answer.overheadCost,
        }, function(err) {
          if (err) throw err;
          console.log("New Department, " + answer.departmentName + ", has been added");
          connection.end();
        })
    })
  })
}