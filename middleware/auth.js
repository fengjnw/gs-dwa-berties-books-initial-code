const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        req.session.returnTo = req.originalUrl; // save the page user wanted to visit
        req.session.loginMessage = 'Please login to access this page'; // save message to display
        res.redirect('/users/login');
    } else {
        next(); // move to the next middleware function
    }
}

// If user is already logged in, prevent access to auth pages (login/register)
const redirectIfLoggedIn = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.render('message', {
            title: 'Already Logged In',
            message: 'You are already logged in. No need to log in or register again.',
            backLink: '/'
        });
    }
    next();
}

module.exports = { redirectLogin, redirectIfLoggedIn };
