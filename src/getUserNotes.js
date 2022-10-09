const mysql = require("mysql");
const databaseName = require("./databaseName");
const getConnectionConfig = require("./getConnectionConfig");
const queryResultToObject = require("./helpers/queryResultToObject");

/**
 * 
 * @param {string | number} userid 
 * @returns Array of user notes
 */
const getUserNotes = (userid) => {

    return new Promise ((resolve, reject) => {

        const db = mysql.createConnection(getConnectionConfig(databaseName));

        db.connect((err) => {
            if (err) reject(err);

            const getUserNotesFromDatabase = `SELECT * FROM notes WHERE userid="${userid}"`
        
            db.query(getUserNotesFromDatabase, (err, result) => {
        
                if (err) reject(err);
                    
                resolve(queryResultToObject(result));
            })
        })
    })
}

module.exports = getUserNotes;