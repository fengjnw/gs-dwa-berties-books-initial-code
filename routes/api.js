// Import express
const express = require("express")
const router = express.Router()

// Import validation modules
const { check, validationResult } = require('express-validator');

router.get('/books', [
    check('search').optional().isLength({ max: 100 }).trim().escape(),
    check('min_price').optional().isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
    check('max_price').optional().isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),
    check('sort').optional().isIn(['name', 'price']).withMessage('Sort must be either "name" or "price"')
], function (req, res, next) {

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    // Get parameters from query string and sanitize it
    let searchTerm = req.sanitize(req.query.search) || ''
    let minPrice = req.sanitize(req.query.min_price) || ''
    let maxPrice = req.sanitize(req.query.max_price) || ''
    let sort = req.sanitize(req.query.sort) || ''

    // Validate price range
    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
        return res.status(400).json({ error: 'Minimum price cannot be greater than maximum price' });
    }

    // Build the sql query based on the provided parameters
    let sqlquery = "SELECT * FROM books WHERE name LIKE CONCAT('%', ?, '%')"
    let params = [searchTerm]

    if (minPrice) {
        sqlquery += " AND price >= ?"
        params.push(minPrice)
    }
    if (maxPrice) {
        sqlquery += " AND price <= ?"
        params.push(maxPrice)
    }
    if (sort === 'name') {
        sqlquery += " ORDER BY name ASC"
    } else if (sort === 'price') {
        sqlquery += " ORDER BY price DESC"
    }

    // Execute the sql query
    db.query(sqlquery, params, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.json(err)
            next(err)
        }
        else {
            res.json(result)
        }
    })
})

// Export the router object so index.js can access it
module.exports = router
