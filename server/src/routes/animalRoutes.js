import { Router } from 'express';
import animalController from '../controllers/animalController.js';
import auth, { optionalAuth } from '../middleware/auth.js';
import roleGuard from '../middleware/roleGuard.js';
import { uploadAnimal } from '../middleware/upload.js';

const router = Router();

// Public routes
router.get('/', optionalAuth, animalController.getAnimals);
router.get('/:id', optionalAuth, animalController.getAnimalById);

// Admin routes
router.post('/', auth, roleGuard('admin'), uploadAnimal.single('image'), animalController.createAnimal);
router.put('/:id', auth, roleGuard('admin'), uploadAnimal.single('image'), animalController.updateAnimal);
router.delete('/:id', auth, roleGuard('admin'), animalController.deleteAnimal);

export default router;
