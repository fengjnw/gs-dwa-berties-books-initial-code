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

// Helper function to determine wind direction from degree
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

// Handle weather page request
router.get('/weather', function (req, res, next) {
    const apiKey = process.env.WEATHER_API_KEY;

    // If no city provided, just render the page with no data
    if (!req.query.city) {
        return res.render('weather.ejs', { weatherData: null });
    }

    const city = req.sanitize(req.query.city);
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    // Make the API request
    request(url, function (err, response, body) {
        if (err) {
            console.error('Weather API error:', err.message);
            return next(err);
        }

        // Parse the JSON response
        let weather;
        try {
            weather = JSON.parse(body);
        } catch (parseError) {
            console.error('JSON parse error:', parseError.message);
            return next(parseError);
        }

        // Check API response status
        if (weather.cod != 200) {
            return res.render('message', {
                title: 'Error',
                message: `Failed to get weather data of ${city}. Please check the city name and try again.`,
                backLink: '/weather'
            });
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
    });
});

// Export the router object so index.js can access it
module.exports = router