var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk");
var Table = require("cli-table");
var updateInventory = 0;
var totalRev = 0;


// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_DB"
});

showInventory();
// shopping();

function showInventory() {
  var table = new Table({
    head: ['ItemID', 'Product Name', 'Department Name', 'Price($)', 'Quantity'],
    colWidths: [10, 30, 20, 10, 10]});
  console.log(chalk.blue.bold("\nAll Products For Sale: "));
  connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      for (var i=0; i<res.length; i++) {
        table.push(
        [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
        );
      }
      console.log(table.toString());
      shopping();
        
  });
};

function shopping() {
    var chosenItem;

    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;

        inquirer.prompt([
        {
            name: "itemID",
            type: "input",
            message: "What is the itemID that you would like to buy?"
         },
         {
            name: "quantity",
            type: "input",
            message: "How many do you want to buy?"
         }
         ]).then(function(answer) {

               for (var i = 0; i < results.length; i++) {
                  if (results[i].item_id == answer.itemID) {
                        chosenItem = results[i];
                        if (results[i].stock_quantity < answer.quantity) {
                          console.log(chalk.red.bold("Insufficient quantity! Try different item ..."));
                          showInventory();
                          shopping();
                        }
                        else if(results[i].stock_quantity >= answer.quantity) {
                          purchase(answer.itemID, chosenItem.product_name, answer.quantity, chosenItem.price, chosenItem.product_sales);
                          updateQuantity(answer.itemID, chosenItem.stock_quantity, answer.quantity);
                          // showInventory();
                        }
                  }
                }

          });
      });
  };


  function purchase(item, prodName, quantity, price, prodSales) {
    var totalPurchase = quantity * price;
    var totalPurchaseFixed = totalPurchase.toFixed(2);
    console.log("Your total purchase for " + chalk.blue.bold(quantity + " " + prodName) + " at $" + price + " each is $" + chalk.blue.bold(totalPurchaseFixed) + "\n");
    
    prodSales += totalPurchase;

    connection.query("UPDATE products SET ? WHERE ?", 
      [
        { product_sales: prodSales
        }, 
        {
          item_id: item
        }
      ], function(err) {
        if (err) throw err;
      })
  };



  function updateQuantity(item, instock, sold) {
    updateInventory = instock - sold;
    connection.query("UPDATE products SET ? WHERE ?",
      [
        {
          stock_quantity: updateInventory
        },
        {
          item_id: item
        }
      ], function(err) {
            if (err) throw err;
            console.log("Order Complete!  Thank you for your business!\n");
        })
      connection.end();
  }



  


