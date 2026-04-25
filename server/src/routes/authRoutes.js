import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authController.js';
import auth from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';
import validate from '../middleware/validate.js';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/).withMessage('Password must contain at least one special character'),
    validate,
  ],
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  authController.login
);

// GET /api/auth/me
router.get('/me', auth, authController.getProfile);

// PUT /api/auth/me
router.put('/me', auth, uploadAvatar.single('avatar'), authController.updateProfile);

// DELETE /api/auth/me
router.delete('/me', auth, authController.deleteAccount);

// PUT /api/auth/change-password
router.put(
  '/change-password',
  auth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('New password must contain at least one number')
      .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/).withMessage('New password must contain at least one special character'),
    validate,
  ],
  authController.changePassword
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(), validate],
  authController.forgotPassword
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('otp').trim().matches(/^\d{4}$/).withMessage('OTP must be exactly 4 digits'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/).withMessage('Password must contain at least one special character'),
    validate
  ],
  authController.resetPassword
);

export default router;
