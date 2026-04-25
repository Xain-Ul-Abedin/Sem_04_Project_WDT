import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import ApiError from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Multer File Upload Middleware
 * Handles image uploads with file type validation and size limits.
 * Files are stored in server/uploads/{category}/ directories.
 */

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Storage configuration
const createStorage = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', '..', 'uploads', folder);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${folder}-${uniqueSuffix}${ext}`);
    },
  });
};

// File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_TYPES.join(', ')}`), false);
  }
};

// Create upload instances for each category
export const uploadAnimal = multer({
  storage: createStorage('animals'),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const uploadGallery = multer({
  storage: createStorage('gallery'),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const uploadEvent = multer({
  storage: createStorage('events'),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const uploadAvatar = multer({
  storage: createStorage('avatars'),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
