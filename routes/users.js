// Create a new router
const express = require("express")
const router = express.Router()

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', function (req, res, next) {
    // validate input
    if (!req.body.first || !req.body.last || !req.body.email) {
        res.send("Please provide first name, last name, and email.");
        return;
    }
    // saving data in database
    res.send(' Hello ' + req.body.first + ' ' + req.body.last + ' you are now registered!  We will send an email to you at ' + req.body.email + '<br>' + '<a href="/">Back</a>');
});

// Export the router object so index.js can access it
module.exports = router
