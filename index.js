// Import express and ejs
var express = require('express')
var ejs = require('ejs')
var session = require('express-session')
const path = require('path')
const expressSanitizer = require('express-sanitizer');

// Import mysql2
const mysql = require('mysql2');

// Import dotenv
require('dotenv').config();

// Create the express application object
const app = express()
const port = 8000

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

// Create an input sanitizer
app.use(expressSanitizer());

// Set up public folder (for css and static js)
app.use(express.static(path.join(__dirname, 'public')))

// Define our application-specific data
app.locals.shopData = { shopName: "Bertie's Books" }

// Set up the session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        // Limit cookie to this site only and reduce attack surface
        httpOnly: true,  // prevent client side JS access
        sameSite: 'lax', // prevent CSRF attacks
        secure: false,   // set to true if using https
        maxAge: 600000   // 10 minutes
    }
}))

// Make session available to all templates (never null)
app.use((req, res, next) => {
    res.locals.session = req.session || {};
    next();
});

// Inject base path for cloud deployment (set via environment variable)
// On cloud server: set BASE_PATH=/usr/347
// On local: leave empty or set to empty string
app.use((req, res, next) => {
    res.locals.basePath = process.env.BASE_PATH || '';

    // Override res.redirect to automatically prepend basePath for absolute paths
    const originalRedirect = res.redirect.bind(res);
    res.redirect = function (url) {
        // If url starts with /, prepend basePath
        if (typeof url === 'string' && url.startsWith('/')) {
            url = res.locals.basePath + url;
        }
        return originalRedirect(url);
    };

    next();
});

// CSRF token injection disabled

// 
const db = mysql.createPool({
    host: process.env.BB_HOST || 'localhost',
    user: process.env.BB_USER,
    password: process.env.BB_PASSWORD,
    database: process.env.BB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
global.db = db;

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load the route handlers for /books
const booksRoutes = require('./routes/books')
app.use('/books', booksRoutes)

// CSRF error handler removed

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`))