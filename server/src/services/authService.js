import crypto from 'crypto';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Auth Service - Business Logic Layer
 * Handles registration, login, profile management, and password reset flows.
 */
class AuthService {
  normalizeEmail(email) {
    return email.trim().toLowerCase();
  }

  hashOtp(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  generateOtp() {
    return crypto.randomInt(1000, 10000).toString();
  }

  generateToken(userId, tokenVersion = 0) {
    return jwt.sign({ id: userId, tokenVersion }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  validatePasswordStrength(password) {
    if (password.length < 8) {
      throw ApiError.badRequest('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      throw ApiError.badRequest('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw ApiError.badRequest('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
      throw ApiError.badRequest('Password must contain at least one special character');
    }
  }

  sanitizeUser(user) {
    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;
    delete safeUser.resetPasswordOtpHash;
    delete safeUser.resetPasswordExpires;
    return safeUser;
  }

  async register({ name, email, password, phone }) {
    const normalizedEmail = this.normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    this.validatePasswordStrength(password);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone?.trim() || '',
    });

    return {
      user: this.sanitizeUser(user),
      token: this.generateToken(user._id, user.tokenVersion),
    };
  }

  async login(email, password) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been suspended. Please contact support.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    return {
      user: this.sanitizeUser(user),
      token: this.generateToken(user._id, user.tokenVersion),
    };
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  async updateProfile(userId, updates, avatarFile = null) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const allowedFields = ['name', 'phone'];
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        user[key] = typeof updates[key] === 'string' ? updates[key].trim() : updates[key];
      }
    }

    const shouldRemoveAvatar = updates.removeAvatar === true || updates.removeAvatar === 'true';

    if (shouldRemoveAvatar && user.avatar && user.avatar.startsWith('/uploads/')) {
      this.deleteFile(user.avatar);
      user.avatar = '';
    }

    if (avatarFile) {
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        this.deleteFile(user.avatar);
      }

      user.avatar = `/uploads/avatars/${avatarFile.filename}`;
    }

    await user.save();
    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    this.validatePasswordStrength(newPassword);

    if (currentPassword === newPassword) {
      throw ApiError.badRequest('New password must be different from the current password');
    }

    user.password = newPassword;
    user.tokenVersion += 1;
    await user.save();

    return {
      message: 'Password changed successfully',
      user: this.sanitizeUser(user),
      token: this.generateToken(user._id, user.tokenVersion),
    };
  }

  async forgotPassword(email) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return { message: 'If an account exists with that email, an OTP has been sent.' };
    }

    const otp = this.generateOtp();
    user.resetPasswordOtpHash = this.hashOtp(otp);
    user.resetPasswordExpires = Date.now() + env.RESET_TOKEN_EXPIRES_IN;
    await user.save({ validateBeforeSave: false });

    console.log(`Password Reset OTP for ${normalizedEmail}: ${otp}`);

    return { message: 'If an account exists with that email, an OTP has been sent.' };
  }

  async resetPassword(email, otp, newPassword) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordOtpHash: this.hashOtp(otp),
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      throw ApiError.badRequest('Invalid or expired OTP');
    }

    this.validatePasswordStrength(newPassword);

    user.password = newPassword;
    user.tokenVersion += 1;
    user.resetPasswordOtpHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully. You can now log in with your new password.' };
  }

  async deleteAccount(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.isActive = false;
    user.tokenVersion += 1;
    await user.save();

    return { message: 'Your account has been deactivated successfully.' };
  }

  deleteFile(filePath) {
    try {
      const fullPath = path.join(__dirname, '..', '..', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Error deleting avatar:', error.message);
    }
  }
}

export default new AuthService();
