
const getConnectionConfig = (databaseName) => {

    if (databaseName) {
        
        return config = {
            host: "localhost",
            user: "root",
            password: process.env.PASSWORD,
            database: databaseName,
        }

    } else {

        return config = {
            host: "localhost",
            user: "root",
            password: process.env.PASSWORD,
        }
        
    }
}

module.exports = getConnectionConfig