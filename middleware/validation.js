const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 * If validation fails, renders a template with error messages and provides a back link
 * @param {string} backUrl - URL to return to (e.g., '/users/register')
 * @param {string} title - Title for error page (e.g., 'Registration Failed')
 */
const handleValidationErrors = (backUrl, title = 'Validation Failed') => {
    return (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Render validation errors template
            res.render('validation_errors', {
                title: title,
                errors: errors.array(),
                backLink: backUrl
            });
            return;
        }
        next(); // No errors, continue to next middleware
    };
};

module.exports = { handleValidationErrors };
