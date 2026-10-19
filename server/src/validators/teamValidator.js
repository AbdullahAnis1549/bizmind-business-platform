import { body } from 'express-validator';
import { validate } from './index.js';

export const teamMemberValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['manager', 'staff'])
    .withMessage('Role must be either manager or staff.'),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
  validate,
];
