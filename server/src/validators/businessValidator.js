import { body } from 'express-validator';
import { validate } from './index.js';

export const onboardingValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Business name is required.'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter currency code (e.g. USD).'),
  validate,
];
