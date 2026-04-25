import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Animal from '../models/Animal.js';
import GalleryItem from '../models/GalleryItem.js';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import ApiError from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Admin Service — Business Logic Layer
 * Rules: AD1-AD5
 */
class AdminService {
  /**
   * Get dashboard statistics
   * Rule AD4: Real-time aggregation
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalAnimals,
      totalBookings,
      revenueResult,
      pendingBookings,
      todayVisitors,
    ] = await Promise.all([
      User.countDocuments({ role: 'visitor', isActive: true }),
      Animal.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Booking.countDocuments({ status: 'pending' }),
      Booking.aggregate([
        {
          $match: {
            visitDate: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
            status: { $in: ['confirmed', 'completed'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalVisitors' } } },
      ]),
    ]);

    return {
      totalUsers,
      totalAnimals,
      totalBookings,
      totalRevenue: revenueResult[0]?.total || 0,
      pendingBookings,
      todayVisitors: todayVisitors[0]?.total || 0,
    };
  }

  /**
   * Revenue report by date range
   * Rule AD2: Consistent timezone handling
   */
  async getRevenueReport(startDate, endDate) {
    const match = {
      paymentStatus: 'paid',
      createdAt: {},
    };
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
    if (!startDate && !endDate) delete match.createdAt;

    const report = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
          visitors: { $sum: '$totalVisitors' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalRevenue = report.reduce((sum, day) => sum + day.revenue, 0);
    const totalBookings = report.reduce((sum, day) => sum + day.bookings, 0);

    return { report, totalRevenue, totalBookings };
  }

  /**
   * Visitor analytics
   */
  async getVisitorReport(startDate, endDate) {
    const match = {
      status: { $in: ['confirmed', 'completed'] },
    };
    if (startDate || endDate) {
      match.visitDate = {};
      if (startDate) match.visitDate.$gte = new Date(startDate);
      if (endDate) match.visitDate.$lte = new Date(endDate);
    }

    const [byTicketType, byDay] = await Promise.all([
      Booking.aggregate([
        { $match: match },
        { $unwind: '$tickets' },
        {
          $group: {
            _id: '$tickets.ticketName',
            count: { $sum: '$tickets.quantity' },
            revenue: { $sum: '$tickets.subtotal' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Booking.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitDate' } },
            visitors: { $sum: '$totalVisitors' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return { byTicketType, byDay };
  }

  /**
   * Get all users
   * Rule AD5: Exclude password hashes
   */
  async getUsers({ page = 1, limit = 20, search, scope }) {
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (scope === 'active') {
      query.isActive = true;
    }

    if (scope === 'history') {
      query.isActive = false;
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit), // AD5
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Change user role
   * Rules: AD3 (cannot delete last admin), A6 (admin can't deactivate themselves)
   */
  async changeUserRole(targetUserId, currentAdminId, newRole) {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) throw ApiError.notFound('User not found');

    // A6: Admin cannot change their own role
    if (targetUserId.toString() === currentAdminId.toString()) {
      throw ApiError.badRequest('You cannot change your own role');
    }

    // AD3: Cannot remove the last admin
    if (targetUser.role === 'admin' && newRole === 'visitor') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        throw ApiError.badRequest('Cannot remove the last admin. Promote another user first.');
      }
    }

    targetUser.role = newRole;
    await targetUser.save();
    return targetUser;
  }

  /**
   * Toggle user active status
   * Rule A6: Admin cannot deactivate themselves
   */
  async toggleUserStatus(targetUserId, currentAdminId) {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) throw ApiError.notFound('User not found');

    if (targetUserId.toString() === currentAdminId.toString()) {
      throw ApiError.badRequest('You cannot deactivate your own account');
    }

    targetUser.isActive = !targetUser.isActive;
    await targetUser.save();
    return targetUser;
  }

  async deleteHistoryRecord(entity, recordId, currentAdminId) {
    switch (entity) {
      case 'users':
        return this.deleteInactiveUser(recordId, currentAdminId);
      case 'bookings':
        return this.deleteTerminalBooking(recordId);
      case 'animals':
        return this.deleteInactiveAnimal(recordId);
      case 'gallery':
        return this.deleteArchivedGalleryItem(recordId);
      case 'tickets':
        return this.deleteInactiveTicket(recordId);
      default:
        throw ApiError.badRequest('Unsupported history entity');
    }
  }

  async clearHistory(entity, currentAdminId) {
    switch (entity) {
      case 'users':
        return this.clearInactiveUsers(currentAdminId);
      case 'bookings':
        return this.clearTerminalBookings();
      case 'animals':
        return this.clearInactiveAnimals();
      case 'gallery':
        return this.clearArchivedGallery();
      case 'tickets':
        return this.clearInactiveTickets();
      default:
        throw ApiError.badRequest('Unsupported history entity');
    }
  }

  async deleteInactiveUser(userId, currentAdminId) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    if (user._id.toString() === currentAdminId.toString()) {
      throw ApiError.badRequest('You cannot permanently delete your own account');
    }
    if (user.isActive) {
      throw ApiError.badRequest('Only inactive users can be permanently deleted');
    }
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      this.deleteFile(user.avatar);
    }
    await User.findByIdAndDelete(userId);
    return { message: 'User permanently deleted' };
  }

  async clearInactiveUsers(currentAdminId) {
    const users = await User.find({ isActive: false, _id: { $ne: currentAdminId } });
    users.forEach((user) => {
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        this.deleteFile(user.avatar);
      }
    });
    const result = await User.deleteMany({ isActive: false, _id: { $ne: currentAdminId } });
    return { message: `${result.deletedCount} inactive user records permanently deleted` };
  }

  async deleteTerminalBooking(bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');
    if (!['completed', 'cancelled'].includes(booking.status)) {
      throw ApiError.badRequest('Only completed or cancelled bookings can be permanently deleted');
    }
    await Booking.findByIdAndDelete(bookingId);
    return { message: 'Booking permanently deleted' };
  }

  async clearTerminalBookings() {
    const result = await Booking.deleteMany({ status: { $in: ['completed', 'cancelled'] } });
    return { message: `${result.deletedCount} history bookings permanently deleted` };
  }

  async deleteInactiveAnimal(animalId) {
    const animal = await Animal.findById(animalId);
    if (!animal) throw ApiError.notFound('Animal not found');
    if (animal.isActive) {
      throw ApiError.badRequest('Only inactive animals can be permanently deleted');
    }
    if (animal.imageUrl && animal.imageUrl.startsWith('/uploads/')) {
      this.deleteFile(animal.imageUrl);
    }
    await Animal.findByIdAndDelete(animalId);
    return { message: 'Animal permanently deleted' };
  }

  async clearInactiveAnimals() {
    const animals = await Animal.find({ isActive: false });
    animals.forEach((animal) => {
      if (animal.imageUrl && animal.imageUrl.startsWith('/uploads/')) {
        this.deleteFile(animal.imageUrl);
      }
    });
    const result = await Animal.deleteMany({ isActive: false });
    return { message: `${result.deletedCount} inactive animals permanently deleted` };
  }

  async deleteArchivedGalleryItem(itemId) {
    const item = await GalleryItem.findById(itemId);
    if (!item) throw ApiError.notFound('Gallery item not found');
    if (item.isActive) {
      throw ApiError.badRequest('Only archived gallery items can be permanently deleted');
    }
    if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
      this.deleteFile(item.imageUrl);
    }
    await GalleryItem.findByIdAndDelete(itemId);
    return { message: 'Gallery item permanently deleted' };
  }

  async clearArchivedGallery() {
    const items = await GalleryItem.find({ isActive: false });
    items.forEach((item) => {
      if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
        this.deleteFile(item.imageUrl);
      }
    });
    const result = await GalleryItem.deleteMany({ isActive: false });
    return { message: `${result.deletedCount} archived gallery items permanently deleted` };
  }

  async deleteInactiveTicket(ticketId) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw ApiError.notFound('Ticket type not found');
    if (ticket.isActive) {
      throw ApiError.badRequest('Only inactive tickets can be permanently deleted');
    }
    await Ticket.findByIdAndDelete(ticketId);
    return { message: 'Ticket permanently deleted' };
  }

  async clearInactiveTickets() {
    const result = await Ticket.deleteMany({ isActive: false });
    return { message: `${result.deletedCount} inactive tickets permanently deleted` };
  }

  deleteFile(filePath) {
    try {
      const fullPath = path.join(__dirname, '..', '..', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Error deleting file:', error.message);
    }
  }
}

export default new AdminService();
