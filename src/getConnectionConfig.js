
const getConnectionConfig = (databaseName) => {
    
    return config = {
        host: "localhost",
        user: "root",
        password: process.env.PASSWORD,
        database: databaseName,
    }
}

module.exports = getConnectionConfig