
const validateCookie = (req, res, next) => {
    const {cookies} = req;

    if ("session_id" in cookies) {
        console.log("Session ID exists");
        if (cookies.session_id === "123") next();
        else res.status(403).send({msg: "Not Authenticated"});
    }
    else res.status(403).send({msg: "Not Authenticated"});
}

module.exports = validateCookie;