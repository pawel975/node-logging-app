const mysql = require("mysql");
const getConnectionConfig = require("./getConnectionConfig");

const tablesToCreate = [
    {
        tableName: "users",
        query: `CREATE TABLE users (
                    id INT AUTO_INCREMENT PRIMARY KEY, 
                    username varchar(255), 
                    password varchar(255)
                );`
    },
    {
        tableName: "notes",
        query: `CREATE TABLE notes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    userid INT, 
                    title varchar(255), 
                    text varchar(255)
                );`
    },
]

const initDatabaseTables = (databaseName) => {
    
    const db = mysql.createConnection(getConnectionConfig(databaseName));
    
    db.connect((err) => {
    
        if (err) throw err;

        db.query("show tables", (err, result) => {

            if (err) throw err;
                
            tablesToCreate.forEach(table => {

                const {tableName, query} = table;
                
                const isTableExist = result.find(table => table[`Tables_in_${databaseName}`] === tableName);
                
                if (isTableExist) {

                    console.log(`${tableName} table already exists!`);

                } else {
                    
                    db.query(query, (err, result) => {
                        if (err) throw err;
                        console.log(`${tableName} table is created`);
                    });
                    
                }

            })
            
        });
            
    })

}

module.exports = initDatabaseTables;