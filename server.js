
//// Imports ////

const mysql = require("mysql");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const initConnection = require("./src/initConnection");
const databaseName = require("./src/databaseName");
const getConnectionConfig = require("./src/getConnectionConfig");
const queryResultToObject = require("./src/helpers/queryResultToObject");
// const validateCookie = require("./src/middlewares/validateCookie");


//// Setup ////

// Enables usage of environment variables
require("dotenv").config();

// Init express app
const app = express();

// Making cookie manage easier
app.use(cookieParser());

// Create session
app.use(session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    cookie: {maxAge: 86400000},
    resave: false
}))

// Setting view Engine
app.set("view engine", "ejs");

// Setting static folder
app.use(express.static("public"));

// Routes
const userRouter = require("./routes/users");
app.use("/users", userRouter);

// Enables request body access
app.use(express.urlencoded({extended: true}));

// Enables getting JSON format
app.use(express.json());


//// Application ////

app.route("/")
    .get((req, res) => {
        res.status(200);
        res.redirect("/home-page")
    })

app.route("/home-page")
    .get((req, res) => {
        res.status(200).render("home-page");
    })
    .post((req, res) => {
        res.status(200).render("home-page");
    })

app.route("/register-page")
    .all((req, res) => {
        res.status(200);
        res.render("register-page")
    })

app.route("/logging-page")
    .get((req, res) => {
        res.status(200);
        res.render("logging-page")
    })
    .post((req, res) => {

        // If there is no form data send to logging page, render logging page
        if (!Object.keys(req.body).length) {
            res.status(200).render("logging-page");
        } else {
            
            // Validate registration params
            const registrationParams = {
                registrationUsername: req.body.username,
                registrationPassword: req.body.password,
                registrationConfirmPassword: req.body.confirmPassword
            }
    
            const {registrationUsername, registrationPassword, registrationConfirmPassword} = registrationParams;
    
            const areRegistrationParamsValid = Boolean(
                registrationUsername &&
                registrationPassword &&
                registrationPassword === registrationConfirmPassword
            );
    
            // If registration params are valid, register user in database
            if (areRegistrationParamsValid) {
    
                const saveLoginDataToDatabase = `INSERT INTO users (username, password)
                VALUES ('${registrationUsername}', '${registrationPassword}');`;
                        
                const db = mysql.createConnection(getConnectionConfig(databaseName));
    
                db.query(saveLoginDataToDatabase, (err, result) => {
                    if (err) throw err;
                    console.log("User registered")
                })
    
                res.status(200);
                res.render("logging-page")
    
            } else {
                res.redirect("/register-page");
                console.log("Invalid form of registration data");
            }
        }

    });

app.route("/user-dashboard")
    .get((req, res) => {

        const session = req.session;

        const {username} = session;

        if (username) {
            res.status(200);
            res.render("user-dashboard", {username: username});
        } else {
            res.status(403).render("error", {
                text: "Unauthorized access - you're not logged in", 
                status: 403
            })
        }
    })
    .post((req, res) => {

        console.log("try to login")
        // Checking if logging data format is valid
        const loggingParams = {
            loggingUsername: req.body.username,
            loggingPassword: req.body.password,
        } 

        const {loggingUsername, loggingPassword} = loggingParams;

        const isLoggingDataValid = Boolean(loggingUsername && loggingPassword);

        // If logging data format is valid check in database if user is registered
        if (isLoggingDataValid) {

            const getAllLoginDataFromDatabase = `SELECT * FROM users;`;    
            
            const db = mysql.createConnection(getConnectionConfig(databaseName));
                
            db.query(getAllLoginDataFromDatabase, (err, result) => {

                if (err) throw err;

                const allUsers = queryResultToObject(result);
                const user = allUsers.find(user => 
                    user.username === loggingUsername && user.password === loggingPassword
                )

                if (user) {

                    const session = req.session;

                    session.userid = user.id
                    session.username = user.username;
                    session.password = user.password;

                    const {username} = session;

                    res.status(200).render("user-dashboard", {username: username});

                } else {
                    res.status(301).redirect("/logging-page");
                }
                
            })
        } else {
            res.status(301).redirect("/logging-page");
        }
    })

app.route("/loggedout-page")
    .post((req, res) => {
        req.session.destroy();
        res.status(200);
        res.render("loggedout-page");
    })

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
                const isTableExist = result.find(table => table[`Tables_in_${databaseName}`] === "users");
    
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