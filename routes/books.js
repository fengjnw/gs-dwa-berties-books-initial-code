// Create a new router
const express = require("express")
const router = express.Router()
const { redirectLogin } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Handle search page request
router.get('/search', function (req, res, next) {
    res.render("search.ejs")
});

// Handle search requests
router.get('/search_result', [
    check('search_text').notEmpty().withMessage('Search text is required').trim(),
    check('search_text').isLength({ max: 100 }).withMessage('Search text must not exceed 100 characters'),
    check('search_mode').notEmpty().withMessage('Search mode is required'),
    check('search_mode').isIn(['Exact Match', 'Partial Match']).withMessage('Invalid search mode. Must be "Exact Match" or "Partial Match"')
], handleValidationErrors('/books/search', 'Search Failed'), function (req, res, next) {
    const search_text = req.sanitize(req.query.search_text);
    const search_mode = req.query.search_mode; // No need to sanitize, already validated
    //searching in the database
    // build query and search term, depending on search mode
    const isExact = search_mode === 'Exact Match';
    // if Exact Match is selected, we use '=' operator
    // if Partial Match is selected, we use 'LIKE' operator with wildcards
    const sqlquery = isExact
        ? "SELECT * FROM books WHERE name = ?"
        : "SELECT * FROM books WHERE name LIKE ?";
    // if Exact Match is selected, we use the term as is
    // if Partial Match is selected, we wrap the term with '%' wildcards
    const searchTerm = isExact
        ? search_text
        : '%' + search_text + '%';
    // execute sql query
    db.query(sqlquery, [searchTerm], (err, result) => {
        if (err) {
            next(err)
        }
        // if no books found, inform the user
        if (result.length === 0) {
            res.render('message', {
                title: 'No Books Found',
                message: 'No books found matching your search.',
                backLink: '/books/search'
            });
            return;
        }
        res.render("search_result.ejs", { searched_books: result, search_text: search_text, search_mode: search_mode })
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
        // if no books found, inform the user
        if (result.length === 0) {
            res.render('message', {
                title: 'No Books',
                message: 'No books available for now.',
                backLink: '/'
            });
            return;
        }
        res.render("book_list.ejs", { availableBooks: result })
    });
});

router.get('/addbook', redirectLogin, function (req, res, next) {
    res.render("addbook.ejs")
});

// Handle add book request
router.post('/bookadded', redirectLogin, [
    // Validation rules with custom error messages
    check('name').notEmpty().withMessage('Book name is required').trim(),
    check('name').isLength({ min: 1, max: 50 }).withMessage('Book name must be between 1 and 50 characters'),
    check('price').notEmpty().withMessage('Price is required'),
    check('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number')
], handleValidationErrors('/books/addbook', 'Add Book Failed'), function (req, res, next) {
    const name = req.sanitize(req.body.name);
    const price = req.body.price; // Already validated as float
    const priceFloat = parseFloat(price);
    if (!Number.isFinite(priceFloat) || priceFloat < 0) {
        res.render('message', {
            title: 'Add Book Failed',
            message: 'Please enter a non-negative price for the book.',
            backLink: '/books/addbook'
        });
        return;
    }
    // saving data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
    // execute sql query
    let newrecord = [name, priceFloat]
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        }
        else
            res.send(' This book is added to database, name: ' + name + ' price ' + priceFloat + '<br>' + '<a href="/books/addbook">Add another book</a>');
    })
});

// Handle bargain books request
router.get('/bargainbooks', function (req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20"; // query database to get all the books cheaper than 20
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        // if no books found, inform the user
        if (result.length === 0) {
            res.render('message', {
                title: 'No Bargain Books',
                message: 'No books on bargain offer for now.',
                backLink: '/'
            });
            return;
        }
        res.render("bargainbooks.ejs", { bargainBooks: result })
    });
});

// Handle delete book request (POST instead of GET to avoid unintended deletions)
router.post('/delete/:id', redirectLogin, [
    check('id').isInt({ min: 1 }).withMessage('Invalid book ID. Must be a positive integer')
], function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect('/books/list');
    }
    const bookId = parseInt(req.params.id, 10);
    let sqlquery = "DELETE FROM books WHERE id = ?"; // query database to delete the book with the specified id
    db.query(sqlquery, [bookId], (err) => {
        if (err) {
            next(err);
        } else {
            res.redirect('/books/list');
        }
    });
});

// Export the router object so index.js can access it
module.exports = router
