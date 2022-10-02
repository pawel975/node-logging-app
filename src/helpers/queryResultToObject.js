
const queryResultToObject = (queryResult) => {
    return JSON.parse(JSON.stringify(queryResult));
}

module.exports = queryResultToObject;