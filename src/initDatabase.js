const mysql = require('mysql');
const getConnectionConfig = require('./getConnectionConfig');

// Init connection to create db on server if needed
const initDatabase = (databaseName) => {

    return new Promise(resolve => {

        const connection = mysql.createConnection(getConnectionConfig());
        
        connection.connect((err) => {
    
            if (err) throw err;
    
            const findDatabase = `SELECT schema_name FROM information_schema.schemata 
                                    WHERE schema_name="${databaseName}";`
        
            // Query Database to check if exists
            connection.query(findDatabase, (err, result) => {
    
                if (err) throw err;
        
                if (result.length !== 0) {
                    console.log("Database already exists");

                    resolve(result);

                } else {
                
                    const createDatabase = `CREATE DATABASE ${databaseName}`;
                
                    connection.query(createDatabase, (err, result) => {
    
                        if (err) throw err;
                        
                        console.log("Database created");
                        resolve(result);

                    });
                }
            })
        });

    })
    
}

module.exports = initDatabase;
