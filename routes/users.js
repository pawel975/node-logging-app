const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("User List");
})

router.get("/new", (req, res) => {
    res.send("User New Form");
})

router.post("/", (req, res) => {
    res.send("Create user");
})

// :id i dynamic param which is accessible from req.params object (req.params.id)

router
    .route("/:id")
    .get((req, res) => {
        req.params.id
        res.send(`Get user with ID of ${req.params.id}`);
    })
    .put((req, res) => {
        req.params.id
        res.send(`Update user with ID of ${req.params.id}`);
    })
    .delete((req, res) => {
        req.params.id
        res.send(`Delete user with ID of ${req.params.id}`);
    })

const users = [{name: "Kyle"}, {name: "Sally"}]

router.param("id", (req, res, next, id) => {
    console.log(id);
    next(); 
})

module.exports = router;