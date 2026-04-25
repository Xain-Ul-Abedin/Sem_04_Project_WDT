import ticketService from '../services/ticketService.js';
import ApiResponse from '../utils/ApiResponse.js';

class TicketController {
  async getTickets(req, res, next) {
    try {
      const isAdmin = req.user?.role === 'admin';
      const tickets = isAdmin
        ? await ticketService.getAllTickets()
        : await ticketService.getActiveTickets();
      return ApiResponse.ok(res, 'Tickets retrieved', tickets);
    } catch (error) {
      next(error);
    }
  }

  async createTicket(req, res, next) {
    try {
      const ticket = await ticketService.createTicket(req.body);
      return ApiResponse.created(res, 'Ticket type created', ticket);
    } catch (error) {
      next(error);
    }
  }

  async updateTicket(req, res, next) {
    try {
      const ticket = await ticketService.updateTicket(req.params.id, req.body);
      return ApiResponse.ok(res, 'Ticket type updated', ticket);
    } catch (error) {
      next(error);
    }
  }
}

export default new TicketController();
