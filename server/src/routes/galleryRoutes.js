import { Router } from 'express';
import galleryController from '../controllers/galleryController.js';
import auth, { optionalAuth } from '../middleware/auth.js';
import roleGuard from '../middleware/roleGuard.js';
import { uploadGallery } from '../middleware/upload.js';

const router = Router();

// Public
router.get('/', optionalAuth, galleryController.getGalleryItems);
router.get('/featured', galleryController.getFeaturedItems);

// Admin
router.post('/', auth, roleGuard('admin'), uploadGallery.single('image'), galleryController.addGalleryItem);
router.put('/:id', auth, roleGuard('admin'), uploadGallery.single('image'), galleryController.updateGalleryItem);
router.delete('/:id', auth, roleGuard('admin'), galleryController.deleteGalleryItem);

export default router;
