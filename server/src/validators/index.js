import { validationResult } from 'express-validator';

/**
 * Middleware that inspects validation errors and returns consistent 400 responses
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map((err) => err.msg);
    return res.status(400).json({
      success: false,
      message: errorList[0],
      errors: errorList,
    });
  }
  next();
};
