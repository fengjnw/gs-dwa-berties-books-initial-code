// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const { redirectLogin, redirectIfLoggedIn } = require('../middleware/auth');

router.get('/register', redirectIfLoggedIn, function (req, res, next) {
    res.render('register.ejs')
})

// Handle user registration request
router.post('/registered', redirectIfLoggedIn, [
    // Validation rules with custom error messages
    check('username').notEmpty().withMessage('Username is required'),
    check('username').isLength({ min: 1, max: 20 }).withMessage('Username must be between 1 and 20 characters'),
    check('username').isAlphanumeric().withMessage('Username must contain only letters and numbers'),
    check('password').notEmpty().withMessage('Password is required'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    check('first').notEmpty().withMessage('First name is required'),
    check('last').notEmpty().withMessage('Last name is required'),
    check('email').notEmpty().withMessage('Email is required'),
    check('email').isEmail().withMessage('Please enter a valid email address'),
    check('email').isLength({ max: 50 }).withMessage('Email must not exceed 50 characters')
], handleValidationErrors('/users/register', 'Registration Failed'), function (req, res, next) {
    // sanitize inputs
    const username = req.sanitize(req.body.username);
    const password = req.body.password;
    const first = req.sanitize(req.body.first);
    const last = req.sanitize(req.body.last);
    const email = req.body.email;
    let sqlquery = "SELECT * FROM users WHERE username = ?";
    // execute sql query to check if username already exists
    db.query(sqlquery, [username], (err, result) => {
        if (err) {
            return next(err);
        }
        if (result.length > 0) {
            res.render('message', {
                title: 'Registration Failed',
                message: 'Username already exists. Please choose a different username.',
                backLink: '/users/register'
            });
            return;
        }
        // hash password
        const plainPassword = password;
        const saltRounds = 10;
        bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
            // Store hashed password in your database
            if (err) {
                res.render('message', {
                    title: 'Registration Failed',
                    message: 'Error hashing password.',
                    backLink: '/users/register'
                });
                return;
            }
            // saving data in database
            let insertQuery = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)";
            // execute sql query
            let newrecord = [username, first, last, email, hashedPassword];
            db.query(insertQuery, newrecord, (err, result) => {
                if (err) {
                    next(err);
                } else {
                    res.render('message', {
                        title: 'Registration Successful',
                        message: `Hello ${first} ${last}, you are now registered! We will send an email to you at ${email}.`,
                        backLink: '/'
                    });
                }
            });
        });
    });
});

// Handle list users request
router.get('/list', redirectLogin, function (req, res, next) {
    // Code to retrieve and display list of users from the database would go here
    let sqlquery = "SELECT * FROM users"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        // if no books found, inform the user
        if (result.length === 0) {
            res.render('message', {
                title: 'No Users',
                message: 'No users registered yet.',
                backLink: '/'
            });
            return;
        }
        res.render("user_list.ejs", { users: result })
    });
});

// Handle delete user request (POST)
router.post('/delete/:id', redirectLogin, [
    check('id').isInt({ min: 1 }).withMessage('Invalid user ID. Must be a positive integer')
], function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect('/users/list');
    }
    const userId = parseInt(req.params.id, 10);
    let sqlquery = "DELETE FROM users WHERE id = ?";
    db.query(sqlquery, [userId], (err) => {
        if (err) {
            next(err);
        } else {
            res.redirect('/users/list');
        }
    });
});

// Handle user login request
router.get('/login', redirectIfLoggedIn, function (req, res, next) {
    const message = req.session.loginMessage || '';
    delete req.session.loginMessage; // clear the message after reading
    res.render('login.ejs', { message: message })
});

// Handle user logged in request
router.post('/loggedin', redirectIfLoggedIn, [
    // Validation rules with custom error messages
    check('username').notEmpty().withMessage('Username is required'),
    check('password').notEmpty().withMessage('Password is required')
], handleValidationErrors('/users/login', 'Login Failed'), function (req, res, next) {
    const username = req.sanitize(req.body.username);
    const password = req.body.password;
    // log the login attempt
    let logQuery = "INSERT INTO login_attempts (username, success, ip_address, reason) VALUES (?, ?, ?, ?)";
    // retrieve user from database
    let sqlquery = "SELECT * FROM users WHERE username = ?";
    // execute sql query
    db.query(sqlquery, [username], (err, result) => {
        if (err) {
            next(err)
        }
        if (result.length === 0) {
            db.query(logQuery, [username, false, req.ip, 'User not found']);
            res.render('message', {
                title: 'Login Failed',
                message: 'User not found.',
                backLink: '/users/login'
            });
            return;
        }
        const hashedPassword = result[0].hashedPassword;
        // compare password
        bcrypt.compare(password, hashedPassword, function (err, isMatch) {
            if (err) {
                next(err)
            }
            if (isMatch) {
                // Save user session here, when login is successful
                req.session.userId = username;
                db.query(logQuery, [username, true, req.ip, 'Login successful']);
                // Determine page user wanted to visit, or home page
                const returnTo = req.session.returnTo || '/';
                delete req.session.returnTo; // clean up
                delete req.session.loginMessage; // clean up message
                // Show success message with a manual Back link (no auto-redirect)
                res.render('message', {
                    title: 'Login Successful',
                    message: `Welcome back, ${username}!`,
                    backLink: returnTo
                });
            } else {
                db.query(logQuery, [username, false, req.ip, 'Incorrect password']);
                res.render('message', {
                    title: 'Login Failed',
                    message: 'Incorrect password.',
                    backLink: '/users/login'
                });
            }
        });
    });
});

router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/')
        }
        // Ensure templates no longer see a logged-in session for this response
        res.locals.session = {};
        res.render('message', {
            title: 'Logged Out',
            message: 'You are now logged out.',
            backLink: '/'
        });
    })
})


// Audit user login
router.get('/audit', redirectLogin, function (req, res, next) {
    let sqlquery = "SELECT * FROM login_attempts ORDER BY timestamp DESC";
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err);
        }
        // if no records found, inform the user
        if (!result || result.length === 0) {
            const basePath = res.locals.basePath || '';
            res.render('message', {
                title: 'No Login Attempts',
                message: 'No login attempts recorded.',
                backLink: basePath + '/'
            });
            return;
        }
        res.render("login_audit.ejs", { loginAttempts: result });
    });
});

// Handle delete login attempt request (POST)
router.post('/audit/delete/:id', redirectLogin, [
    check('id').isInt({ min: 1 }).withMessage('Invalid attempt ID. Must be a positive integer')
], function (req, res, next) {
    const errors = validationResult(req);
    const basePath = res.locals.basePath || '';
    if (!errors.isEmpty()) {
        return res.redirect(basePath + '/users/audit');
    }
    const attemptId = parseInt(req.params.id, 10);
    let sqlquery = "DELETE FROM login_attempts WHERE id = ?";
    db.query(sqlquery, [attemptId], (err) => {
        if (err) {
            next(err);
        } else {
            res.redirect(basePath + '/users/audit');
        }
    });
});

// Export the router object so index.js can access it
module.exports = router