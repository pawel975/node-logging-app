const mysql = require('mysql');
const getConnectionConfig = require('./getConnectionConfig');

// Init connection to create db on server if needed
const initDatabase = (databaseName) => {

    return new Promise((resolve, reject) => {

        const db = mysql.createConnection(getConnectionConfig());
        
        db.connect((err) => {
    
            if (err) reject(err);
    
            const findDatabase = `SELECT schema_name FROM information_schema.schemata 
                                    WHERE schema_name="${databaseName}";`
        
            // Query Database to check if exists
            db.query(findDatabase, (err, result) => {
    
                if (err) reject(err);
        
                if (result.length !== 0) {
                    
                    console.log("Database already exists");

                    resolve(result);

                } else {
                
                    const createDatabase = `CREATE DATABASE ${databaseName}`;
                
                    db.query(createDatabase, (err, result) => {
    
                        if (err) reject(err);
                        
                        console.log("Database created");

                        resolve(result);

                    });
                }
            })
        });

    })
    
}

module.exports = initDatabase;
