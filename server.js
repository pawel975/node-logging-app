
//// Imports ////

const mysql = require("mysql");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const initDatabase = require("./src/initDatabase");
const initDatabaseTables = require("./src/initDatabaseTables");
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
const getUserNotes = require("./src/getUserNotes");
app.use("/users", userRouter);

// Enables request body access
app.use(express.urlencoded({extended: true}));

// Enables getting JSON format
app.use(express.json());


//// Application ////

app.route("/")
    .get((req, res) => {
        res.status(200);
        res.redirect("/home")
    })

app.route("/home")
    .get((req, res) => {
        res.status(200).render("home-page");
    })
    .post((req, res) => {
        res.status(200).render("home-page");
    })

app.route("/register")
    .all((req, res) => {
        res.status(200);
        res.render("register-page")
    })

app.route("/logging")
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
    
                const registerUserToDatabase = `INSERT INTO users (username, password)
                VALUES ('${registrationUsername}', '${registrationPassword}');`;
                        
                const db = mysql.createConnection(getConnectionConfig(databaseName));
    
                db.query(registerUserToDatabase, (err, result) => {

                    if (err) throw err;

                    console.log("User registered")
                })
    
                res.status(200);
                res.render("logging-page")
    
            } else {
                res.redirect("/register");
                console.log("Invalid form of registration data");
            }
        }
    });

app.route("/user-dashboard")
    .all((req, res) => {

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
                
            db.connect((err) => {

                if (err) throw err;

                db.query(getAllLoginDataFromDatabase, async (err, result) => {
    
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
                        
                        const {username, userid} = session;

                        const allUserNotes = await getUserNotes(db, userid)

                        res.status(200).render("user-dashboard", {
                            username: username,
                            notes: allUserNotes
                        })

                    } else {
                        res.status(301).redirect("/logging");
                    }
                    
                })

            });
            
        } else {
            res.status(301).redirect("/logging");
        }
    })

app.route("/loggedout")
    .all((req, res) => {
        req.session.destroy();
        res.status(200);
        res.render("loggedout-page");
    })

app.route("/deleted-account")
    .all((req, res) => {

        const {userid} = req.session;

        if (userid) {
            
            const deleteUserFromDatabase = `DELETE FROM users WHERE id="${userid}"`;
    
            const db = mysql.createConnection(getConnectionConfig(databaseName));
    
            db.query(deleteUserFromDatabase, (err, result) => {
    
                if (err) throw err;
    
                console.log("User has been deleted successfully");
            })
    
            req.session.destroy();
            res.status(200);
            res.render("deleted-account-page");
        } else {
            res.status(403).render("error", {
                text: "Unauthorized access - you're not logged in", 
                status: 403
            });
        }
    })

app.route("/note-created")
    .all((req, res) => {

        const session = req.session;
        
        const  {userid} = session;
        
        if (userid) {
            
            const {noteTitle, noteText} = req.body;

            const saveNoteToDatabase = `INSERT INTO notes (userid, title, text)
                                            VALUES ("${userid}", "${noteTitle}", "${noteText}")`

            const db = mysql.createConnection(getConnectionConfig(databaseName));

            db.query(saveNoteToDatabase, (err, result) => {
                if (err) throw err;

                console.log("Note successfully added to database");
            })

            res.status(200).render("note-created");
        } else {
            res.status(403).render("error", {
                status: 403,
                text: "Unauthorized access - you're not logged in"
            });
        }
    })

app.listen(8080, () => {
    console.log("Server listen on port 8080...");
});

const init = async () => {

    // Creates database on mysql server if doesn't exist
    await initDatabase(databaseName);
    
    // Populates database with users table
    initDatabaseTables(databaseName);
}

init();

