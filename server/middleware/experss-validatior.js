const { body } = require('express-validator');

module.exports.validaation = [
    body('email')
        .notEmpty()
        .withMessage('Pease enter an email !')
        .isEmail()
        .withMessage('Please provide valid email !'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name can not be empty'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description can not be empty')
        .isLength({ min: 50 })
        .withMessage('Description length must be at least 50 CHAR'),
];