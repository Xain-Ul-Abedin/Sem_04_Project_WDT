import bookingService from '../services/bookingService.js';
import ApiResponse from '../utils/ApiResponse.js';

class BookingController {
  async createBooking(req, res, next) {
    try {
      const booking = await bookingService.createBooking(req.user._id, req.body);
      return ApiResponse.created(res, 'Booking created successfully', booking);
    } catch (error) {
      next(error);
    }
  }

  async processPayment(req, res, next) {
    try {
      const booking = await bookingService.processPayment(
        req.params.id, req.user._id, req.body.paymentMethod
      );
      return ApiResponse.ok(res, 'Payment processed successfully', booking);
    } catch (error) {
      next(error);
    }
  }

  async getUserBookings(req, res, next) {
    try {
      const result = await bookingService.getUserBookings(req.user._id, req.query);
      return ApiResponse.paginated(res, 'Bookings retrieved', result.bookings, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req, res, next) {
    try {
      const isAdmin = req.user.role === 'admin';
      const booking = await bookingService.getBookingById(req.params.id, req.user._id, isAdmin);
      return ApiResponse.ok(res, 'Booking retrieved', booking);
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const booking = await bookingService.cancelBooking(req.params.id, req.user._id);
      return ApiResponse.ok(res, 'Booking cancelled successfully', booking);
    } catch (error) {
      next(error);
    }
  }

  async updateBookingStatus(req, res, next) {
    try {
      const booking = await bookingService.updateBookingStatus(req.params.id, req.body.status);
      return ApiResponse.ok(res, 'Booking status updated', booking);
    } catch (error) {
      next(error);
    }
  }

  async getAllBookings(req, res, next) {
    try {
      const result = await bookingService.getAllBookings(req.query);
      return ApiResponse.paginated(res, 'All bookings retrieved', result.bookings, result.pagination);
    } catch (error) {
      next(error);
    }
  }
}

export default new BookingController();
