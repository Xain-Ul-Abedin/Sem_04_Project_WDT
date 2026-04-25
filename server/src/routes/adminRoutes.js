import { Router } from 'express';
import adminController from '../controllers/adminController.js';
import auth from '../middleware/auth.js';
import roleGuard from '../middleware/roleGuard.js';

const router = Router();

// All admin routes require auth + admin role
router.use(auth, roleGuard('admin'));

router.get('/stats', adminController.getStats);
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/visitors', adminController.getVisitorReport);
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.changeUserRole);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.delete('/history/:entity/:id', adminController.deleteHistoryRecord);
router.delete('/history/:entity', adminController.clearHistory);

export default router;
