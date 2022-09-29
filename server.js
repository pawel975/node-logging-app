const mysql = require("mysql");
const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");

const initConnection = require("./src/initConnection");
const databaseName = require("./src/databaseName");
const getConnectionConfig = require("./src/getConnectionConfig");

// Enables usage of environment variables
require("dotenv").config();

// Init express app
const app = express();

// Setting view Engine
app.set("view engine", "ejs");

// Setting static folder
app.use(express.static("public"));

// Routes
const userRouter = require("./routes/users");
app.use("/users", userRouter);

// Enables request body access
app.use(express.urlencoded({extended: true}));

// Middleware
app.use(logger);
function logger(req, res, next) {
    console.log(req.originalUrl);
    next();
}

app.get("/", (req, res) => {
    res.status(200);
    res.render("register-page")
});

app.route("/logging-page")
    .get((req, res) => {
        res.status(200);
        res.render("logging-page", {registrationParams: {}})
    })
    .post((req, res) => {

        const registrationParams = {
            username: req.body.username,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        } 

        const isNewUserDataValid = registrationParams.password === registrationParams.confirmPassword;

        if (isNewUserDataValid) {
            res.status(200);
            res.render("logging-page", {registrationParams: registrationParams})
        } else {
            res.redirect("/");
            console.log("Error");
        }
    });

app.post("/users-table", (req, res) => {

    const loggingParams = {
        username: req.body.username,
        password: req.body.password
    }

    const isLoggingDataValid = Boolean(loggingParams.username && loggingParams.password)

    if (isLoggingDataValid) {
        res.status(200);
        res.render("users-table", {loggingParams: loggingParams});
    } else {
        console.log("Error");
        res.redirect("/logging-page");
    }
});

app.listen(8080, () => {
    console.log("Server listen on port 8080...");
});


// Creates database on mysql server if doesn't exist
initConnection(databaseName);

const db = mysql.createConnection(getConnectionConfig(databaseName));

    db.connect((err) => {

        if (err) throw err;
    
        db.query("show tables", (err, result) => {
            
            if (err) throw err;

            const createTable = `CREATE TABLE users 
                                (id INT AUTO_INCREMENT PRIMARY KEY, 
                                username varchar(255), 
                                password varchar(255));`

            if (result.length === 0) {

                db.query(createTable,  (err, result) => {
                    if (err) throw err;
                    console.log("Table created");
                });
            } else {
                const isTableExist = result.filter(table => table[`Tables_in_${databaseName}`] === "users")[0];
    
                if (isTableExist) {
                    console.log("Table already exists!");
                } else {
    
                    db.query(createTable, (err, result) => {
                        if (err) throw err;
                        console.log("Table created");
                    });
                }
    
            }
    
        })
      
    });




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