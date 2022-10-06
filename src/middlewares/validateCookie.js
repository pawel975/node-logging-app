
const validateCookie = (req, res, next) => {
    const {cookies} = req;

    if ("session_id" in cookies) {
        console.log("Session ID exists");
        if (cookies.session_id === "123") next();
        else res.status(403).render("error", {
            text: "Unauthorized access - you're not logged in", 
            status: 403
        });
    }
    else res.status(403).render("error", {
        text: "Unauthorized access - you're not logged in", 
        status: 403
    });
}

module.exports = validateCookie;