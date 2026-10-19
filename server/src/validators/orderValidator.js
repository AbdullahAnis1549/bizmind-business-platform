import { body } from 'express-validator';
import { validate } from './index.js';

export const createOrderValidator = [
  body('customerId')
    .notEmpty()
    .withMessage('Customer is required for an order.')
    .isMongoId()
    .withMessage('Valid customer ID is required.'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one product item is required in the order.'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for every order item.')
    .isMongoId()
    .withMessage('Valid product ID is required for each item.'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required.')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than 0.'),
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a non-negative number.'),
  body('taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100 percent.'),
  body('status')
    .optional()
    .isIn(['Pending', 'Processing', 'Completed', 'Cancelled'])
    .withMessage('Order status must be Pending, Processing, Completed, or Cancelled.'),
  body('paymentStatus')
    .optional()
    .isIn(['Unpaid', 'Partial', 'Paid'])
    .withMessage('Payment status must be Unpaid, Partial, or Paid.'),
  validate,
];
