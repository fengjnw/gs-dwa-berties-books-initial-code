// Create a new router
const express = require("express")
const router = express.Router()

// Handle search page request
router.get('/search', function (req, res, next) {
    res.render("search.ejs")
});

// Handle search requests
router.get('/search_result', function (req, res, next) {
    //searching in the database
    // validate input
    if (!req.query.search_text) {
        res.send("Please enter a search term." + "<br>" + "<a href='/books/search'>Back</a>");
        return;
    }
    // build query and search term, depending on search mode
    const isExact = req.query.search_mode === 'Exact Match';
    // if Exact Match is selected, we use '=' operator
    // if Partial Match is selected, we use 'LIKE' operator with wildcards
    const sqlquery = isExact
        ? "SELECT * FROM books WHERE name = ?"
        : "SELECT * FROM books WHERE name LIKE ?";
    // if Exact Match is selected, we use the term as is
    // if Partial Match is selected, we wrap the term with '%' wildcards
    const searchTerm = isExact
        ? req.query.search_text
        : '%' + req.query.search_text + '%';
    // execute sql query
    db.query(sqlquery, [searchTerm], (err, result) => {
        if (err) {
            next(err)
        }
        // if no books found, inform the user
        if (result.length === 0) {
            res.send("No books found." + "<br>" + "<a href='/books/search'>Back</a>");
            return;
        }
        res.render("search_result.ejs", { searched_books: result, search_text: req.query.search_text })
    });
});

// Handle list books request
router.get('/list', function (req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        if (result.length === 0) {
            res.send("No books for now." + "<br>" + "<a href='/'>Back</a>");
            return;
        }
        res.render("list.ejs", { availableBooks: result })
    });
});

router.get('/addbook', function (req, res, next) {
    res.render("addbook.ejs")
});

// Handle bargain books request
router.get('/bargainbooks', function (req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20"; // query database to get all the books cheaper than 20
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        if (result.length === 0) {
            res.send("No books on bargain offer for now." + "<br>" + "<a href='/'>Back</a>");
            return;
        }
        res.render("bargainbooks.ejs", { bargainBooks: result })
    });
});

// Export the router object so index.js can access it
module.exports = router
