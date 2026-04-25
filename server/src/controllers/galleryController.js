import galleryService from '../services/galleryService.js';
import ApiResponse from '../utils/ApiResponse.js';

class GalleryController {
  async getGalleryItems(req, res, next) {
    try {
      const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true';
      const result = await galleryService.getGalleryItems({ ...req.query, includeInactive });
      return ApiResponse.paginated(res, 'Gallery items retrieved', result.items, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedItems(req, res, next) {
    try {
      const items = await galleryService.getFeaturedItems();
      return ApiResponse.ok(res, 'Featured items retrieved', items);
    } catch (error) {
      next(error);
    }
  }

  async addGalleryItem(req, res, next) {
    try {
      const item = await galleryService.addGalleryItem(req.body, req.file);
      return ApiResponse.created(res, 'Gallery item added', item);
    } catch (error) {
      next(error);
    }
  }

  async updateGalleryItem(req, res, next) {
    try {
      const item = await galleryService.updateGalleryItem(req.params.id, req.body, req.file);
      return ApiResponse.ok(res, 'Gallery item updated', item);
    } catch (error) {
      next(error);
    }
  }

  async deleteGalleryItem(req, res, next) {
    try {
      const result = await galleryService.deleteGalleryItem(req.params.id);
      return ApiResponse.ok(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export default new GalleryController();
