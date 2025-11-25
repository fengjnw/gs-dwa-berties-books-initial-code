// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

// Middleware function to check if user is logged in
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login') // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
}

// Handle user registration request
router.post('/registered', function (req, res, next) {
    // validate input
    if (!req.body.username || !req.body.first || !req.body.last || !req.body.email || !req.body.password) {
        res.send("Please provide username, first name, last name, email, and password.");
        return;
    }
    let sqlquery = "SELECT * FROM users WHERE username = ?";
    // execute sql query to check if username already exists
    db.query(sqlquery, [req.body.username], (err, result) => {
        if (err) {
            next(err)
        }
        if (result.length > 0) {
            res.send("Username already exists. Please choose a different username." + "<br>" + "<a href='/users/register'>Back</a>");
            return;
        }
    });
    // hash password
    const plainPassword = req.body.password;
    const saltRounds = 10
    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
        // Store hashed password in your database
        if (err) {
            res.send("Error hashing password.");
            return;
        }
        // saving data in database
        let sqlquery = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)"
        // execute sql query
        let newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword]
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                next(err)
            }
            else {
                result = 'Hello ' + req.body.first + ' ' + req.body.last + ' you are now registered!  We will send an email to you at ' + req.body.email;
                result += '\nYour password is: ' + req.body.password + ' and your hashed password is: ' + hashedPassword;
                result += '<br><a href="/">Back to Home</a>';
                res.send(result);
            }
        });
    })
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
            res.send("No users for now." + "<br>" + "<a href='/'>Back</a>");
            return;
        }
        res.render("user_list.ejs", { users: result })
    });
});

// Handle delete user request
router.get('/delete/:id', redirectLogin, function (req, res, next) {
    let userId = req.params.id;
    let sqlquery = "DELETE FROM users WHERE id = ?"; // query database to delete the user with the specified id
    // execute sql query
    db.query(sqlquery, [userId], (err, result) => {
        if (err) {
            next(err)
        } else {
            res.redirect('../list');
        }
    });
});

// Handle user login request
router.get('/login', function (req, res, next) {
    res.render('login.ejs')
});

// Handle user logged in request
router.post('/loggedin', function (req, res, next) {
    // validate input
    if (!req.body.username || !req.body.password) {
        res.send("Please provide both username and password. " + "<br>" + "<a href='/users/login'>Back</a>");
        return;
    }
    // log the login attempt
    let logQuery = "INSERT INTO login_attempts (username, success, ip_address, reason) VALUES (?, ?, ?, ?)";
    // retrieve user from database
    let sqlquery = "SELECT * FROM users WHERE username = ?";
    // execute sql query
    db.query(sqlquery, [req.body.username], (err, result) => {
        if (err) {
            next(err)
        }
        if (result.length === 0) {
            res.send("User not found." + "<br>" + "<a href='/users/login'>Back</a>");
            db.query(logQuery, [req.body.username, false, req.ip, 'User not found']);
            return;
        }
        const hashedPassword = result[0].hashedPassword;
        // compare password
        bcrypt.compare(req.body.password, hashedPassword, function (err, isMatch) {
            if (err) {
                next(err)
            }
            if (isMatch) {
                // Save user session here, when login is successful
                req.session.userId = req.body.username;
                res.send("Login successful! Welcome " + req.body.username + "<br><a href='/'>Back to Home</a>");
                db.query(logQuery, [req.body.username, true, req.ip, 'Login successful']);
            } else {
                res.send("Incorrect password." + "<br>" + "<a href='/users/login'>Back</a>");
                db.query(logQuery, [req.body.username, false, req.ip, 'Incorrect password']);
            }
        });
    });
});

router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('./')
        }
        res.send('you are now logged out. <a href=' + '../' + '>Home</a>');
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
            res.send("No login attempts recorded." + "<br>" + "<a href='/'>Back</a>");
            return;
        }
        res.render("login_audit.ejs", { loginAttempts: result });
    });
});

// Handle delete login attempt request
router.get('/audit/delete/:id', redirectLogin, function (req, res, next) {
    let attemptId = req.params.id;
    let sqlquery = "DELETE FROM login_attempts WHERE id = ?"; // query database to delete the login attempt with the specified id
    // execute sql query
    db.query(sqlquery, [attemptId], (err, result) => {
        if (err) {
            next(err)
        } else {
            res.redirect('../../audit');
        }
    });
});

// Export the router object so index.js can access it
module.exports = router
module.exports.redirectLogin = redirectLogin;