import { body } from 'express-validator';
import { validate } from './index.js';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
  validate,
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
  validate,
];

export const verifyOtpValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.'),
  body('otp')
    .notEmpty()
    .withMessage('Verification code is required.')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits.'),
  validate,
];
