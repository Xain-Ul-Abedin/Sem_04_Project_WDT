import Booking from '../models/Booking.js';
import Ticket from '../models/Ticket.js';
import ApiError from '../utils/ApiError.js';

/**
 * Booking Service — Business Logic Layer
 * Handles the complete booking lifecycle.
 * All business rules (B1-B14) are enforced here.
 */
class BookingService {
  buildStatusQuery(status, scope) {
    if (status) {
      const statuses = String(status)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

      if (statuses.length === 1) {
        return statuses[0];
      }

      if (statuses.length > 1) {
        return { $in: statuses };
      }
    }

    if (scope === 'history') {
      return { $in: ['completed', 'cancelled'] };
    }

    if (scope === 'active') {
      return { $in: ['pending', 'confirmed'] };
    }

    return null;
  }

  /**
   * Create a new booking
   * Rules: B1-B8, B12, B13
   */
  async createBooking(userId, bookingData) {
    const { visitDate, tickets, visitors, specialRequests, paymentMethod } = bookingData;

    const visit = new Date(visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // B1: Cannot book a past date
    if (visit < today) {
      throw ApiError.badRequest('Cannot book a visit for a past date');
    }

    // B2: Cannot book more than 90 days in advance
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    if (visit > maxDate) {
      throw ApiError.badRequest('Cannot book more than 90 days in advance');
    }

    // B3: Minimum 1 ticket required
    if (!tickets || tickets.length === 0) {
      throw ApiError.badRequest('At least one ticket is required');
    }

    // B6: Recalculate totals server-side (never trust client)
    let totalAmount = 0;
    let totalVisitors = 0;
    const processedTickets = [];

    for (const ticketItem of tickets) {
      // B12: Only active ticket types can be booked
      const ticketType = await Ticket.findById(ticketItem.ticketType);
      if (!ticketType) {
        throw ApiError.badRequest(`Ticket type not found: ${ticketItem.ticketType}`);
      }
      if (!ticketType.isActive) {
        throw ApiError.badRequest(`Ticket type "${ticketType.name}" is no longer available`);
      }

      // B5: Validate quantity
      const qty = parseInt(ticketItem.quantity);
      if (qty < 1 || qty > ticketType.maxPerBooking) {
        throw ApiError.badRequest(
          `Quantity for "${ticketType.name}" must be between 1 and ${ticketType.maxPerBooking}`
        );
      }

      // B13: Snapshot price at creation time
      const subtotal = ticketType.price * qty;
      processedTickets.push({
        ticketType: ticketType._id,
        ticketName: ticketType.name,
        unitPrice: ticketType.price,
        quantity: qty,
        subtotal,
      });

      totalAmount += subtotal;
      totalVisitors += qty;
    }

    // B4: Maximum 10 tickets per booking
    if (totalVisitors > 10) {
      throw ApiError.badRequest('Maximum 10 tickets per booking');
    }

    // B7: Visitor count must match ticket quantity
    if (visitors && visitors.length !== totalVisitors) {
      throw ApiError.badRequest(
        `Visitor details count (${visitors.length}) must match total tickets (${totalVisitors})`
      );
    }

    // Validate payment method (P1)
    const allowedPaymentMethods = ['visa', 'mastercard', 'jazzcash', 'easypaisa', 'cash_on_arrival'];
    if (paymentMethod && !allowedPaymentMethods.includes(paymentMethod)) {
      throw ApiError.badRequest(`Invalid payment method. Allowed: ${allowedPaymentMethods.join(', ')}`);
    }

    // B8: Generate unique booking reference
    const bookingRef = await this.generateBookingRef();

    const booking = await Booking.create({
      user: userId,
      bookingRef,
      visitDate: visit,
      tickets: processedTickets,
      totalAmount,
      totalVisitors,
      visitors: visitors || [],
      specialRequests: specialRequests || '',
      paymentMethod: paymentMethod || '',
      status: 'pending',
      paymentStatus: paymentMethod === 'cash_on_arrival' ? 'unpaid' : 'unpaid', // P5
    });

    return booking;
  }

  /**
   * Process mock payment (P2)
   * Simulates a 2-second payment processing delay
   */
  async processPayment(bookingId, userId, paymentMethod) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');

    // B9: Only owner can pay
    if (booking.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only pay for your own bookings');
    }

    // P3: Can only pay for unpaid bookings
    if (booking.paymentStatus !== 'unpaid') {
      throw ApiError.badRequest(`Booking is already ${booking.paymentStatus}`);
    }

    const allowedPaymentMethods = ['visa', 'mastercard', 'jazzcash', 'easypaisa', 'cash_on_arrival'];
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      throw ApiError.badRequest('Invalid payment method');
    }

    // P2: Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // P5: Cash on arrival stays pending until admin marks completed
    if (paymentMethod === 'cash_on_arrival') {
      booking.paymentMethod = paymentMethod;
      booking.status = 'confirmed';
      // paymentStatus stays 'unpaid' until cash received
    } else {
      // Mock payment always succeeds
      booking.paymentMethod = paymentMethod;
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
    }

    await booking.save();
    return booking;
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId, { status, scope, page = 1, limit = 10 }) {
    const query = { user: userId };
    const statusQuery = this.buildStatusQuery(status, scope);
    if (statusQuery) query.status = statusQuery;

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('tickets.ticketType', 'name price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query),
    ]);

    return {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single booking by ID
   * Rule B9: Only owner or admin can view
   */
  async getBookingById(bookingId, userId, isAdmin = false) {
    const booking = await Booking.findById(bookingId)
      .populate('tickets.ticketType', 'name price includes')
      .populate('user', 'name email phone');

    if (!booking) throw ApiError.notFound('Booking not found');

    // B9: Access control
    if (!isAdmin && booking.user._id.toString() !== userId.toString()) {
      throw ApiError.forbidden('Access denied');
    }

    return booking;
  }

  /**
   * Cancel booking
   * Rules: B9 (owner only), B10 (status check), B11 (24h rule)
   */
  async cancelBooking(bookingId, userId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');

    // B9: Only owner can cancel
    if (booking.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only cancel your own bookings');
    }

    // B10: Cannot cancel completed or already cancelled bookings
    if (['completed', 'cancelled'].includes(booking.status)) {
      throw ApiError.badRequest(`Cannot cancel a booking that is already ${booking.status}`);
    }

    // B11: Cannot cancel within 24h of visit
    const now = new Date();
    const visitDate = new Date(booking.visitDate);
    const hoursUntilVisit = (visitDate - now) / (1000 * 60 * 60);
    if (hoursUntilVisit < 24) {
      throw ApiError.badRequest('Cannot cancel a booking less than 24 hours before the visit');
    }

    booking.status = 'cancelled';

    // P4: Refund only if paid
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }

    await booking.save();
    return booking;
  }

  /**
   * Admin: Update booking status
   * Rule B14: Valid transitions only
   */
  async updateBookingStatus(bookingId, newStatus) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');

    // B14: Status transition rules
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [], // Terminal state
      cancelled: [], // Terminal state
    };

    if (!validTransitions[booking.status]?.includes(newStatus)) {
      throw ApiError.badRequest(
        `Cannot transition from "${booking.status}" to "${newStatus}". ` +
        `Allowed transitions: ${validTransitions[booking.status].join(', ') || 'none (terminal state)'}`
      );
    }

    booking.status = newStatus;

    // If completing a cash_on_arrival booking, mark as paid
    if (newStatus === 'completed' && booking.paymentMethod === 'cash_on_arrival') {
      booking.paymentStatus = 'paid';
    }

    // If admin cancels a paid booking, issue refund
    if (newStatus === 'cancelled' && booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }

    await booking.save();
    return booking;
  }

  /**
   * Admin: Get all bookings with filters
   */
  async getAllBookings({ status, scope, startDate, endDate, page = 1, limit = 20 }) {
    const query = {};
    const statusQuery = this.buildStatusQuery(status, scope);
    if (statusQuery) query.status = statusQuery;
    if (startDate || endDate) {
      query.visitDate = {};
      if (startDate) query.visitDate.$gte = new Date(startDate);
      if (endDate) query.visitDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email')
        .populate('tickets.ticketType', 'name price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query),
    ]);

    return {
      bookings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * B8: Generate unique booking reference
   * Format: LZ-YYYYMMDD-XXXX (4 random alphanumeric chars)
   */
  async generateBookingRef() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    let ref;
    let exists = true;

    while (exists) {
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      ref = `LZ-${dateStr}-${rand}`;
      exists = await Booking.findOne({ bookingRef: ref });
    }

    return ref;
  }
}

export default new BookingService();
