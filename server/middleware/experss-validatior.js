const { body } = require('express-validator');

module.exports.validation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Please enter an email!')
        .isEmail().withMessage('Please provide a valid email!')
        .normalizeEmail(), // Converts to lowercase and removes dots in gmail etc.

    body('name')
        .trim()
        .notEmpty().withMessage('Name cannot be empty'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description cannot be empty')
        .isLength({ min: 50 }).withMessage('Description must be at least 50 characters long'),

    body('ingredients')
        // This custom sanitizer ensures that even 1 ingredient is treated as an array
        .customSanitizer(value => {
            if (!value) return [];
            return Array.isArray(value) ? value : [value];
        })
        .custom((value) => {
            // Check if the array has at least one non-empty string
            const filtered = value.filter(i => i.trim().length > 0);
            if (filtered.length === 0) {
                throw new Error('Please add at least one ingredient');
            }
            return true;
        })
];