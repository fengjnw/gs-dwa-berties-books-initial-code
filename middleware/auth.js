const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        req.session.returnTo = req.originalUrl; // save the page user wanted to visit
        req.session.loginMessage = 'Please login to access this page'; // save message to display
        res.redirect('/users/login') // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
}

module.exports = { redirectLogin };
