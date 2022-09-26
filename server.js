const mysql = require("mysql");
const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");

// Enables usage of environment variables
require("dotenv").config();

// Init express app
const app = express();

// Setting view Engine
app.set("view engine", "ejs");

// Routes
const userRouter = require("./routes/users");
app.use("/users", userRouter);

// Enables request body access
app.use(express.urlencoded({extended: true}));

// // Middleware
// app.use(logger);
// function logger(req, res, next) {
//     console.log(req.originalUrl);
//     next();
// }

app.get("/", (req, res) => {
    res.status(200);
    res.render("register-page")
});

app.post("/logging-page", (req, res) => {

    const userParams = {
        username: req.body.username,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    } 

    const isNewUserDataValid = userParams.password === userParams.confirmPassword ? true : false;

    if (isNewUserDataValid) {
        res.status(200);
        res.render("logging-page", {userParams: userParams})
    } else {
        res.redirect("/");
        console.log("Error");
    }

});

app.post("/users-table", (req, res) => {
    res.status(200);
    res.render("users-table");
});

app.listen(8080, () => {
    console.log("Server listen on port 8080...");
});


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