
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
        res.redirect("/register-page")
    })

app.route("/register-page")
    .get((req, res) => {

        res.status(200);
        res.cookie("session_id", "123", {
            secure: true,
            httpOnly: true,
        }); // server responds with cookie and saves it to the browser
        res.render("register-page")
    })
    .post((req, res) => {
        res.status(200);
        res.render("register-page")
    })

app.route("/logging-page")
    .get((req, res) => {
        res.status(200);
        res.render("logging-page")
    })
    .post((req, res) => {

        const loggingParams = {
            username: req.body.username,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        } 

        const {username, password} = loggingParams;

        const session = req.session;

        session.username = username;
        session.password = password;

        const isNewUserDataValid = Boolean(
            loggingParams.username &&
            loggingParams.password &&
            loggingParams.password === loggingParams.confirmPassword
        );

        if (isNewUserDataValid) {
            res.status(200);
            res.render("logging-page")
        } else {
            res.redirect("/register-page");
            console.log("Invalid form of registration data");
        }
    });

    
app.route("/users-table")
    .all((req, res) => {
        
        const loggingParams = {
            username: req.body.username,
            password: req.body.password
        }

        const {username, password} = loggingParams;

        const session = req.session;
        
        if (session.username && (username && password)) {

            const db = mysql.createConnection(getConnectionConfig(databaseName));
            
            db.connect((err) => {
                if (err) throw err;
                
                // const saveLoginDataToDatabase = `INSERT INTO users (username, password)
                // VALUES ('${username}', '${password}');`;
                
                const getAllLoginDataFromDatabase = `SELECT * FROM users;`;          
                
                // db.query(saveLoginDataToDatabase, (err, result) => {
                //     if (err) throw err;
                //     console.log("User login data saved to database")
                // })
                
                db.query(getAllLoginDataFromDatabase, (err, result) => {
                    if (err) throw err;
                    
                    console.log("Get all users login data");

                    const allUsers = queryResultToObject(result);
                    const user = allUsers.find(user => 
                        user.username === username && user.password === password
                    )
                    console.log(allUsers)
                    console.log(user);

                    if (user) {
                        res.render("users-table", {
                            loggingParams: loggingParams,
                            allUsersLoggingParams: allUsers
                        });
                    } else {
                        res.send("Nope");
                    }
                    
                })
            })

            res.status(200);
            
        } else {
            console.log("Invalid login data");
            res.redirect("/logging-page");
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

        // Checking if logging data format is valid
        const loggingParams = {
            loggingUsername: req.body.username,
            loggingPassword: req.body.password,
            loggingConfirmPassword: req.body.confirmPassword
        } 

        const {loggingUsername, loggingPassword, loggingConfirmPassword} = loggingParams;

        const isLoggingDataValid = Boolean(
            loggingUsername &&
            loggingPassword &&
            loggingPassword === loggingConfirmPassword
        );

        // If logging data format is valid check in database if user is registered
        if (isLoggingDataValid) {

            const getAllLoginDataFromDatabase = `SELECT * FROM users;`;          
                
            db.query(getAllLoginDataFromDatabase, (err, result) => {

                if (err) throw err;

                const allUsers = queryResultToObject(result);
                const user = allUsers.find(user => 
                    user.username === loggingUsername && user.password === loggingPassword
                )

                if (user) {

                    const session = req.session;

                    session.username = user.username;
                    session.password = user.password;

                    res.status(200).render("user-dashboard", {username: username});

                } else {
                    res.status(301).redirect("/logging-page");
                }
                
            })
        }

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