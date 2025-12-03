// Create a new router
const express = require("express")
const router = express.Router()
// Import request
const request = require('request')

// Import validation modules
const { check, validationResult } = require('express-validator');

// Handle our routes
router.get('/', function (req, res, next) {
    res.render('index.ejs')
});

// Handle about page request
router.get('/about', function (req, res, next) {
    res.render('about.ejs')
});

router.get('/weather', function (req, res, next) {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!req.query.city) {
        res.render('weather.ejs', { weatherData: null });
        return;
    }
    const city = req.sanitize(req.query.city)
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`

    request(url, function (err, response, body) {
        if (err) {
            next(err)
        } else {
            const weather = JSON.parse(body)
            if (weather.cod != 200) {
                res.render('message', {
                    title: 'City Not Found',
                    message: `Could not find weather data for city: ${city}. Please try again.`,
                    backLink: '/weather'
                });
                return;
            }
            function getWindDirection(degree) {
                if (degree >= 337.5 || degree < 22.5) {
                    return "North";
                } else if (degree >= 22.5 && degree < 67.5) {
                    return "NorthEast";
                } else if (degree >= 67.5 && degree < 112.5) {
                    return "East";
                } else if (degree >= 112.5 && degree < 157.5) {
                    return "SouthEast";
                } else if (degree >= 157.5 && degree < 202.5) {
                    return "South";
                } else if (degree >= 202.5 && degree < 247.5) {
                    return "SouthWest";
                } else if (degree >= 247.5 && degree < 292.5) {
                    return "West";
                } else if (degree >= 292.5 && degree < 337.5) {
                    return "NorthWest";
                } else {
                    return "N/A";
                }
            }
            const windDirection = getWindDirection(weather.wind.deg);
            res.render('weather.ejs', {
                weatherData: {
                    city: weather.name,
                    main: weather.weather[0].main,
                    description: weather.weather[0].description,
                    icon: weather.weather[0].icon,
                    temperature: weather.main.temp,
                    pressure: weather.main.pressure,
                    humidity: weather.main.humidity,
                    wind: weather.wind.speed,
                    windDirection: windDirection,
                    windDegree: weather.wind.deg
                }
            });
        }
    });
});

// Export the router object so index.js can access it
module.exports = router