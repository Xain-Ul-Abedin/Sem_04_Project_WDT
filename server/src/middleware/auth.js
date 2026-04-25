import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

/**
 * JWT Authentication Middleware
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches the user document to req.user.
 */
const authenticate = (required = true) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (!required) {
        return next();
      }

      throw ApiError.unauthorized('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 3. Find user and check if still active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account has been suspended');
    }

    if ((decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
      throw ApiError.unauthorized('Session is no longer valid. Please log in again.');
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (!required && !req.headers.authorization) {
      return next();
    }

    if (error instanceof ApiError) {
      return next(error);
    }
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

const auth = authenticate(true);
export const optionalAuth = authenticate(false);

export default auth;
