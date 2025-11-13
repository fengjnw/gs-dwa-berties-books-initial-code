// Create a new router
const express = require("express")
const router = express.Router()

// Handle our routes
router.get('/', function (req, res, next) {
    res.render('index.ejs')
});

// Handle about page request
router.get('/about', function (req, res, next) {
    res.render('about.ejs')
});

// Handle add book request
router.post('/bookadded', function (req, res, next) {
    // validate input
    if (!req.body.name || !req.body.price) {
        res.send("Please provide both name and price of the book.");
        return;
    }
    // saving data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
    // execute sql query
    let newrecord = [req.body.name, req.body.price]
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        }
        else
            res.send(' This book is added to database, name: ' + req.body.name + ' price ' + req.body.price + '<br>' + '<a href="/books/addbook">Add another book</a>');
    })
})

// Export the router object so index.js can access it
module.exports = router