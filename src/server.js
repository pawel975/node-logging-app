const mysql = require("mysql");
const http = require("http");
const path = require("path");
const fs = require("fs");
// Enables usage of environment variables
require("dotenv").config();

http.createServer((req, res) => {

    if (req.url === "/") {
        fs.readFile(path.join(__dirname, "public", 'register-page.html'), (err, data) => {
            if (err) throw err
            res.writeHead(200, {"Content-Type":"text/html"});
            res.end(data);
        })
    }

    if (req.url === "/logging-page") {
        fs.readFile(path.join(__dirname, "public", 'logging-page.html'), (err, data) => {
            if (err) throw err
            res.writeHead(200, {"Content-Type":"text/html"});
            res.end(data);
        })
    }

    if (req.url === "/users-table") {
        fs.readFile(path.join(__dirname, "public", 'users-table.html'), (err, data) => {
            if (err) throw err
            res.writeHead(200, {"Content-Type":"text/html"});
            res.end(data);
        })
    }

}).listen(8080);


// const con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: process.env.PASSWORD,
//     database: "mydb"
// });

// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//     con.query("CREATE DATABASE mydb", function (err, result) {
//       if (err) throw err;
//       console.log("Database created");
//     });
//   });

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   const sql = "CREATE TABLE examples (id INT AUTO_INCREMENT PRIMARY KEY, name constCHAR(255), address constCHAR(255))";
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     console.log("Table created");
//   });
// });

// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//     const sql = "INSERT INTO examples (name, address) VALUES ('Company Inc', 'Highway 37')";
//     con.query(sql, function (err, result) {
//       if (err) throw err;
//       console.log("1 record inserted");
//       console.log(result)
//     });
//   });