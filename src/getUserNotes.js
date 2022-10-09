const queryResultToObject = require("./helpers/queryResultToObject");

/**
 * 
 * @param {mysql.Connection} db 
 * @param {string | number} userid 
 * @returns Array of user notes
 */
const getUserNotes = (db, userid) => {

    return new Promise (resolve => {

        const getUserNotesFromDatabase = `SELECT * FROM notes WHERE userid="${userid}"`
    
        db.query(getUserNotesFromDatabase, (err, result) => {
    
            if (err) throw err;
                
            resolve(queryResultToObject(result));
        })
    })
}

module.exports = getUserNotes;