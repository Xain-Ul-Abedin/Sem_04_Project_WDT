import animalService from '../services/animalService.js';
import ApiResponse from '../utils/ApiResponse.js';

class AnimalController {
  async getAnimals(req, res, next) {
    try {
      const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true';
      const result = await animalService.getAnimals({ ...req.query, includeInactive });
      return ApiResponse.paginated(res, 'Animals retrieved', result.animals, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getAnimalById(req, res, next) {
    try {
      const includeInactive = req.user?.role === 'admin';
      const animal = await animalService.getAnimalById(req.params.id, includeInactive);
      return ApiResponse.ok(res, 'Animal retrieved', animal);
    } catch (error) {
      next(error);
    }
  }

  async createAnimal(req, res, next) {
    try {
      const animal = await animalService.createAnimal(req.body, req.file);
      return ApiResponse.created(res, 'Animal created successfully', animal);
    } catch (error) {
      next(error);
    }
  }

  async updateAnimal(req, res, next) {
    try {
      const animal = await animalService.updateAnimal(req.params.id, req.body, req.file);
      return ApiResponse.ok(res, 'Animal updated successfully', animal);
    } catch (error) {
      next(error);
    }
  }

  async deleteAnimal(req, res, next) {
    try {
      const result = await animalService.deleteAnimal(req.params.id);
      return ApiResponse.ok(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export default new AnimalController();
