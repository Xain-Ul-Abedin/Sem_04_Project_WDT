import { Router } from 'express';
import bookingController from '../controllers/bookingController.js';
import auth from '../middleware/auth.js';
import roleGuard from '../middleware/roleGuard.js';

const router = Router();

// All booking routes require authentication
router.use(auth);

// POST /api/bookings — Create booking
router.post('/', bookingController.createBooking);

// POST /api/bookings/:id/pay — Process payment
router.post('/:id/pay', bookingController.processPayment);

// GET /api/bookings/my — Get user's bookings
router.get('/my', bookingController.getUserBookings);

// GET /api/bookings/all — Admin: Get all bookings
router.get('/all', roleGuard('admin'), bookingController.getAllBookings);

// GET /api/bookings/:id — Get booking details
router.get('/:id', bookingController.getBookingById);

// PUT /api/bookings/:id/cancel — Cancel booking
router.put('/:id/cancel', bookingController.cancelBooking);

// PUT /api/bookings/:id/status — Admin: Update status
router.put('/:id/status', roleGuard('admin'), bookingController.updateBookingStatus);

export default router;
