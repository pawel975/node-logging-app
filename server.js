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
const queryResultToObject = require("./src/helpers/queryResultToObject");
app.use("/users", userRouter);

// Enables request body access
app.use(express.urlencoded({extended: true}));

// // Middleware
// app.use(logger);
// function logger(req, res, next) {
//     console.log(req.originalUrl);
//     next();
// }

app.route("/")
    .get((req, res) => {
        res.status(301);
        res.redirect("/register-page")
    })
app.route("/register-page")
    .get((req, res) => {
        res.status(200);
        res.render("register-page", {info: info})
    })
    .post((req, res) => {
        res.status(200);
        res.render("register-page")
    })

app.route("/logging-page")
    .get((req, res) => {

        console.log("logging get!")

        res.status(200);
        res.render("logging-page", {registrationParams: {}})
    })
    .post((req, res) => {

        console.log("logging post!!")

        const registrationParams = {
            username: req.body.username,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        } 

        const isNewUserDataValid = Boolean(
            registrationParams.username &&
            registrationParams.password &&
            registrationParams.password === registrationParams.confirmPassword
        );

        if (isNewUserDataValid) {
            res.status(200);
            res.render("logging-page", {registrationParams: registrationParams})
        } else {
            res.redirect(301, "/");
            console.log("Error");
        }
    });

app.route("/users-table") 
    .post((req, res) => {
        
    const loggingParams = {
        username: req.body.username,
        password: req.body.password
    }

    const {username, password} = loggingParams;

    const isLoggingDataValid = Boolean(username && password)

    if (isLoggingDataValid) {
        res.status(200);
        
        const db = mysql.createConnection(getConnectionConfig(databaseName));
        
        db.connect((err) => {
            if (err) throw err;

            const saveLoginDataToDatabase = `INSERT INTO users (username, password)
                                            VALUES ('${username}', '${password}');`;

            const getAllLoginDataFromDatabase = `SELECT * FROM users;`;          

            db.query(saveLoginDataToDatabase, (err, result) => {
                if (err) throw err;
                console.log("User login data saved to database")
            })

            db.query(getAllLoginDataFromDatabase, (err, result) => {
                if (err) throw err;

                console.log("Get all users login data");

                res.render("users-table", {
                    loggingParams: loggingParams,
                    allUsersLoggingParams: queryResultToObject(result)
                });
            })
        })

    } else {
        console.log("Invalid login data");
        res.redirect("/logging-page");
    }
});

app.listen(8080, () => {
    console.log("Server listen on port 8080...");
});


// Creates database on mysql server if doesn't exist
initConnection(databaseName);


setTimeout(() => {

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

}, 500);




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