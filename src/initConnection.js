const mysql = require('mysql');
const getConnectionConfig = require('./getConnectionConfig');

// Init connection to create db on server if needed
const initConnection = (databaseName) => {

    const connection = mysql.createConnection(getConnectionConfig());
    
    connection.connect((err) => {

        if (err) {
            return console.error("error: " + err.message);
        };

        const findDatabase = `SELECT schema_name FROM information_schema.schemata 
                                WHERE schema_name="${databaseName}";`
    
        // Query Database to check if exists
        connection.query(findDatabase, (err, result) => {

            if (err) {
                return console.error("error: " + err.message);
            };
    
            if (result.length !== 0) {
                console.log("Database already exists");
            } else {
            
                const createDatabase = `CREATE DATABASE ${databaseName}`;
            
                connection.query(createDatabase, (err, result) => {

                    if (err) {
                        return console.error("error: " + err.message);
                    };
                    
                    console.log("Database created");
                });
            }
        })
    });
    
}

module.exports = initConnection;
