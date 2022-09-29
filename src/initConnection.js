const mysql = require('mysql');

// Init connection to create db on server if needed
const initConnection = (databaseName) => {

    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: process.env.PASSWORD,
    });
    
    connection.connect((err) => {
    
        if (err) throw err;
    
        // Query Database to check if exists
        connection.query(`SELECT schema_name from information_schema.schemata WHERE schema_name="${databaseName}";`, (err, result) => {
            if (err) throw err;
    
            if (result.length !== 0) {
                console.log("Database already exists");
            } else {
            
                const query = `CREATE DATABASE ${databaseName}`;
            
                connection.query(query, (err, result) => {
                    if (err) throw err;
                    console.log("Database created");
                });
            }
        })
    });
}

module.exports = initConnection;
