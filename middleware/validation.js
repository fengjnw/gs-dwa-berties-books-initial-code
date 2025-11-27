const { validationResult } = require('express-validator');

//  Middleware to handle validation errors
//  If validation fails, renders a template with error messages and provides a back link
const handleValidationErrors = (backUrl, title = 'Validation Failed') => {
    return (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Render validation errors template with 400 Bad Request
            res.status(400).render('validation_errors', {
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
