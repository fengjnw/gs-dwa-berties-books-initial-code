// Create a new router
const express = require("express")
const router = express.Router()

router.get('/search', function (req, res, next) {
    res.render("search.ejs")
});

router.get('/search_result', function (req, res, next) {
    //searching in the database
    // res.send("You searched for: " + req.query.search_text);
    if (!req.query.search_text) {
        res.send("Please enter a search term.");
        return;
    }
    const isExact = req.query.search_mode === 'Exact Match';
    const sqlquery = isExact
        ? "SELECT * FROM books WHERE name = ?"
        : "SELECT * FROM books WHERE name LIKE ?";
    const searchTerm = isExact
        ? req.query.search_text
        : '%' + req.query.search_text + '%';
    db.query(sqlquery, [searchTerm], (err, result) => {
        if (err) {
            next(err)
        }
        if (result.length === 0) {
            res.send("No books found.");
            return;
        }
        res.render("search_result.ejs", { searched_books: result, search_text: req.query.search_text })
    });
});

router.get('/list', function (req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("list.ejs", { availableBooks: result })
    });
});

router.get('/addbook', function (req, res, next) {
    res.render("addbook.ejs")
});

router.get('/bargainbooks', function (req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20"; // query database to get all the books cheaper than 20
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("bargainbooks.ejs", { bargainBooks: result })
    });
});

// Export the router object so index.js can access it
module.exports = router
