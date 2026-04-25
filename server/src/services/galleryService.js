import GalleryItem from '../models/GalleryItem.js';
import ApiError from '../utils/ApiError.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gallery Service — Business Logic Layer
 * Rules: G1-G4
 */
class GalleryService {
  /**
   * Get gallery items with filters
   * Rule G4: Category filter
   */
  async getGalleryItems({ category, includeInactive = false, scope, page = 1, limit = 20 }) {
    const query = {};

    if (scope === 'history') {
      query.isActive = false;
    } else if (scope === 'active') {
      query.isActive = true;
    } else if (!includeInactive) {
      query.isActive = true;
    }

    if (category) query.category = category;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      GalleryItem.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      GalleryItem.countDocuments(query),
    ]);

    return {
      items,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get featured gallery items
   */
  async getFeaturedItems() {
    return GalleryItem.find({ isFeatured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(12); // G3: Max 12 featured
  }

  /**
   * Add gallery item
   * Rule G1: Image file required
   */
  async addGalleryItem(data, imageFile) {
    const normalizedData = this.normalizeGalleryPayload(data);

    // G1: Image required
    if (!imageFile) {
      throw ApiError.badRequest('Image file is required for gallery items');
    }

    normalizedData.imageUrl = `/uploads/gallery/${imageFile.filename}`;

    // G3: Check featured limit
    if (normalizedData.isFeatured) {
      const featuredCount = await GalleryItem.countDocuments({ isFeatured: true, isActive: true });
      if (featuredCount >= 12) {
        // Unfeature the oldest
        const oldest = await GalleryItem.findOne({ isFeatured: true, isActive: true }).sort({ createdAt: 1 });
        if (oldest) {
          oldest.isFeatured = false;
          await oldest.save();
        }
      }
    }

    return GalleryItem.create(normalizedData);
  }

  /**
   * Update gallery item
   */
  async updateGalleryItem(itemId, data, imageFile) {
    const item = await GalleryItem.findById(itemId);
    if (!item) throw ApiError.notFound('Gallery item not found');

    const normalizedData = this.normalizeGalleryPayload(data);

    if (imageFile) {
      // G2: Clean up old file
      if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
        this.deleteFile(item.imageUrl);
      }
      normalizedData.imageUrl = `/uploads/gallery/${imageFile.filename}`;
    }

    Object.assign(item, normalizedData);
    await item.save();
    return item;
  }

  /**
   * Delete gallery item
   * Rule G2: File cleanup
   */
  async deleteGalleryItem(itemId) {
    const item = await GalleryItem.findById(itemId);
    if (!item) throw ApiError.notFound('Gallery item not found');

    item.isActive = false;
    item.isFeatured = false;
    await item.save();
    return { message: 'Gallery item archived successfully' };
  }

  deleteFile(filePath) {
    try {
      const fullPath = path.join(__dirname, '..', '..', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error('Error deleting file:', err.message);
    }
  }

  normalizeGalleryPayload(data) {
    const normalizedData = { ...data };

    if ('isFeatured' in normalizedData) {
      normalizedData.isFeatured =
        normalizedData.isFeatured === true || normalizedData.isFeatured === 'true';
    }

    if ('tags' in normalizedData && typeof normalizedData.tags === 'string') {
      normalizedData.tags = normalizedData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    return normalizedData;
  }
}

export default new GalleryService();
