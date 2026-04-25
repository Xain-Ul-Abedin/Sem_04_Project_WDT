import Ticket from '../models/Ticket.js';
import ApiError from '../utils/ApiError.js';

/**
 * Ticket Service — Business Logic Layer
 */
class TicketService {
  /**
   * Get all active ticket types (public)
   */
  async getActiveTickets() {
    return Ticket.find({ isActive: true }).sort({ price: 1 });
  }

  /**
   * Get all ticket types (admin)
   */
  async getAllTickets() {
    return Ticket.find().sort({ createdAt: -1 });
  }

  /**
   * Create a new ticket type
   */
  async createTicket(data) {
    if (data.price < 0) {
      throw ApiError.badRequest('Ticket price cannot be negative');
    }
    if (data.maxPerBooking && data.maxPerBooking < 1) {
      throw ApiError.badRequest('Max per booking must be at least 1');
    }
    return Ticket.create(data);
  }

  /**
   * Update a ticket type
   */
  async updateTicket(ticketId, data) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw ApiError.notFound('Ticket type not found');

    if (data.price !== undefined && data.price < 0) {
      throw ApiError.badRequest('Ticket price cannot be negative');
    }

    Object.assign(ticket, data);
    await ticket.save();
    return ticket;
  }
}

export default new TicketService();
