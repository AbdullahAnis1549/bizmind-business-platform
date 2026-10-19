import { body } from 'express-validator';
import { validate } from './index.js';

export const createCustomerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required.'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid customer email address.')
    .normalizeEmail(),
  body('status')
    .optional()
    .isIn(['active', 'lead', 'inactive'])
    .withMessage('Customer status must be active, lead, or inactive.'),
  validate,
];

export const updateCustomerValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Customer name cannot be empty.'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid customer email address.')
    .normalizeEmail(),
  body('status')
    .optional()
    .isIn(['active', 'lead', 'inactive'])
    .withMessage('Customer status must be active, lead, or inactive.'),
  validate,
];

export const customerValidator = createCustomerValidator;
