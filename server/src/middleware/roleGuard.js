import ApiError from '../utils/ApiError.js';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks that req.user.role is in the allowed list.
 * Must be used AFTER the auth middleware.
 *
 * Usage: roleGuard('admin')  or  roleGuard('admin', 'visitor')
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access denied. Required role: ${allowedRoles.join(' or ')}`));
    }

    next();
  };
};

export default roleGuard;
