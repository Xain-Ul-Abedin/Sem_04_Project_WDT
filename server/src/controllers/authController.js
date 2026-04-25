import authService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Auth Controller — Presentation Layer
 * Delegates to AuthService, returns standardized responses.
 */
class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;
      const result = await authService.register({ name, email, password, phone });
      return ApiResponse.created(res, 'Registration successful', result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return ApiResponse.ok(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user._id);
      return ApiResponse.ok(res, 'Profile retrieved', user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user._id, req.body, req.file);
      return ApiResponse.ok(res, 'Profile updated', user);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
      return ApiResponse.ok(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      return ApiResponse.ok(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, otp, password } = req.body;
      const result = await authService.resetPassword(email, otp, password);
      return ApiResponse.ok(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const result = await authService.deleteAccount(req.user._id);
      return ApiResponse.ok(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
