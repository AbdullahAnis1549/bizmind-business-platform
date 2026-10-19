import { body } from 'express-validator';
import { validate } from './index.js';

export const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required.'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('Product SKU is required.'),
  body('price')
    .notEmpty()
    .withMessage('Product price is required.')
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid positive number.'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a valid positive number.'),
  body('stock')
    .notEmpty()
    .withMessage('Stock quantity is required.')
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer greater than or equal to 0.'),
  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low-stock threshold must be a non-negative integer.'),
  validate,
];

export const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty.'),
  body('sku')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product SKU cannot be empty.'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid positive number.'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a valid positive number.'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer greater than or equal to 0.'),
  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low-stock threshold must be a non-negative integer.'),
  validate,
];

export const productValidator = createProductValidator;
