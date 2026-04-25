import adminService from '../services/adminService.js';
import ApiResponse from '../utils/ApiResponse.js';

class AdminController {
  async getStats(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      return ApiResponse.ok(res, 'Dashboard stats retrieved', stats);
    } catch (error) {
      next(error);
    }
  }

  async getRevenueReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await adminService.getRevenueReport(startDate, endDate);
      return ApiResponse.ok(res, 'Revenue report retrieved', report);
    } catch (error) {
      next(error);
    }
  }

  async getVisitorReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await adminService.getVisitorReport(startDate, endDate);
      return ApiResponse.ok(res, 'Visitor report retrieved', report);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const result = await adminService.getUsers(req.query);
      return ApiResponse.paginated(res, 'Users retrieved', result.users, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async changeUserRole(req, res, next) {
    try {
      const user = await adminService.changeUserRole(req.params.id, req.user._id, req.body.role);
      return ApiResponse.ok(res, 'User role updated', user);
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const user = await adminService.toggleUserStatus(req.params.id, req.user._id);
      return ApiResponse.ok(res, `User ${user.isActive ? 'activated' : 'deactivated'}`, user);
    } catch (error) {
      next(error);
    }
  }

  async deleteHistoryRecord(req, res, next) {
    try {
      const result = await adminService.deleteHistoryRecord(
        req.params.entity,
        req.params.id,
        req.user._id
      );
      return ApiResponse.ok(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  async clearHistory(req, res, next) {
    try {
      const result = await adminService.clearHistory(req.params.entity, req.user._id);
      return ApiResponse.ok(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
