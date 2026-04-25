import { Router } from 'express';
import ticketController from '../controllers/ticketController.js';
import auth, { optionalAuth } from '../middleware/auth.js';
import roleGuard from '../middleware/roleGuard.js';

const router = Router();

// Public: Get active tickets
router.get('/', optionalAuth, ticketController.getTickets);

// Admin: Create/Update tickets
router.post('/', auth, roleGuard('admin'), ticketController.createTicket);
router.put('/:id', auth, roleGuard('admin'), ticketController.updateTicket);

export default router;
