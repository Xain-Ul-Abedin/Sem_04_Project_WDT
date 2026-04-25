import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Request Validation Middleware
 * Runs after express-validator checks and returns formatted errors.
 * Used as the last validator in the chain.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return next(ApiError.badRequest('Validation failed', formattedErrors));
  }

  next();
};

export default validate;
