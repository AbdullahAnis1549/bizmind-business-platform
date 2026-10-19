import { body } from 'express-validator';
import { validate } from './index.js';

export const createInvoiceValidator = [
  body('customerId')
    .notEmpty()
    .withMessage('Customer is required for invoice creation.')
    .isMongoId()
    .withMessage('Valid customer ID is required.'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Invoice items must be a non-empty array.'),
  body('items.*.name')
    .trim()
    .notEmpty()
    .withMessage('Item name is required.'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Item quantity is required.')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be greater than 0.'),
  body('items.*.price')
    .notEmpty()
    .withMessage('Item price is required.')
    .isFloat({ min: 0 })
    .withMessage('Item price must be a non-negative number.'),
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a non-negative number.'),
  body('taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100 percent.'),
  body('paymentStatus')
    .optional()
    .isIn(['Unpaid', 'Partial', 'Paid'])
    .withMessage('Payment status must be Unpaid, Partial, or Paid.'),
  validate,
];
