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

connection.connect();

managerChoice();


function managerChoice() {
    inquirer.prompt({
            name: "choice",
            type: "rawlist",
            message: "What would you like to do?",
            choices: [
            "View Products for Sale", 
            "View Low Inventory", 
            "Add to Inventory", 
            "Add New Product"]
        }).then(function(answer) {
            if (answer.choice === "View Products For Sale") {
            	viewProducts();
            } 
            else if (answer.choice === "View Low Inventory") {
            	lowInventory();
            }
            else if (answer.choice === "Add to Inventory") {
            	addInventory();
            }
            else if (answer.choice === "Add New Product") {
            	addNewProduct();
            }
            else {
            	connection.end();
            }
        	
	});
}

function viewProducts() {
	connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      console.log(chalk.blue.bold("\nAll Products For Sale: "));
      var table = new Table({
    		head: ['ItemID', 'Product Name', 'Department Name', 'Price($)', 'Quantity'],
    		colWidths: [10, 30, 20, 10, 10]});

      for (var i = 0; i<res.length; i++) {
        table.push(
        	[res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
        	);	 
      }
      console.log(table.toString());
      connection.end();       
  })
};


function lowInventory(){
	var lowInventoryList = [];
	var table = new Table({
    		head: ['ItemID', 'Product Name', 'Department Name', 'Price($)', 'Quantity'],
    		colWidths: [10, 30, 20, 10, 10]});

	connection.query("SELECT * FROM products", function(err, results) {
		if (err) throw err;
		for (var i = 0; i <results.length; i++) {
			if (results[i].stock_quantity < 5) {
				lowInventoryList.push(results[i]);
			}
		}
		
		console.log("\nProducts Low in Stock: ");
		for (var i = 0; i < lowInventoryList.length; i++) {
			table.push(
        	[lowInventoryList[i].item_id, lowInventoryList[i].product_name, lowInventoryList[i].department_name, lowInventoryList[i].price, lowInventoryList[i].stock_quantity]
        	);	 
		}
		console.log(table.toString());

	inquirer.prompt([
		{ name: "confirm",
		  type: "confirm",
		  message: "Do you want to add new stocks to these products?"
		}]).then(function(answer){
			if(answer.confirm === true) {
				addInventory();
			} else {
				console.log("OK! Have a nice day!");
				connection.end();
			}
		});
	});
	
	// connection.end();
};


function addInventory(){
	// lowInventory();
	var addMore;
	var updateInv;
	connection.query("SELECT * FROM products", function(err, results){
		if (err) throw err;
		inquirer.prompt([
			{ name: "itemID",
			  type: "input",
			  message: "Which itemID do you want to reload?"
			},{
			  name: "amount",
			  type: "input",
			  message: "How many additional units do you want to add to stock?"
			}
		]).then(function(answer){
			for (var i=0; i<results.length; i++){
				if (results[i].item_id == answer.itemID) {
					addMore = results[i];
					updateInv = parseInt(addMore.stock_quantity) + parseInt(answer.amount);
				}
			}
			connection.query("UPDATE products SET ? WHERE ?", 
				[
					{ stock_quantity: updateInv

					}, 
					{ item_id: answer.itemID

					}
				], function(err) {
            		if (err) throw err;
            		console.log("ItemID " + answer.itemID + "(" + addMore.product_name + ") inventory has been increased to " + updateInv + " units!\n");
        			viewProducts();
        		})
			
      		// connection.end();
  		})
	})
}

function addNewProduct() {
	connection.query("SELECT * FROM products", function(err, results){
		if (err) throw err;
		inquirer.prompt([
			{ name: "productName",
			  type: "input",
			  message: "What is the product name?"
			},{
			  name: "deptName",
			  type: "input",
			  message: "Which department does this product belong?"
			}, {
			  name: "price",
			  type: "input",
			  message: "What is the unit cost for this product?"
			}, {
			  name: "quantity",
			  type: "input",
			  message: "How many should we stock for this product?"
		}]).then(function(answer){
			connection.query("INSERT INTO products SET ?",
				{ product_name: answer.productName,
				  department_name: answer.deptName,
				  price: answer.price,
				  stock_quantity: answer.quantity
				}, function(err) {
					if (err) throw err;
					console.log("New Product, " + answer.productName + ", has been added");
					viewProducts();
					// connection.end();
				})
			})
		})

}


