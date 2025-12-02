// Create a new router
const express = require("express")
const router = express.Router()
// Import request
const request = require('request')

// Handle our routes
router.get('/', function (req, res, next) {
    res.render('index.ejs')
});

// Handle about page request
router.get('/about', function (req, res, next) {
    res.render('about.ejs')
});

router.get('/weather', function (req, res, next) {
    let apiKey = 'd44dc98a573ec85fca3308cb3e535b96'
    let city = 'london'
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`

    request(url, function (err, response, body) {
        if (err) {
            next(err)
        } else {
            res.send(body)
        }
    });
});

// Export the router object so index.js can access it
module.exports = router