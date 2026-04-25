import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Animal from '../models/Animal.js';
import ApiError from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AnimalService {
  async getAnimals({ category, search, includeInactive = false, scope, page = 1, limit = 20 }) {
    const query = {};

    if (scope === 'history') {
      query.isActive = false;
    } else if (scope === 'active') {
      query.isActive = true;
    } else if (!includeInactive) {
      query.isActive = true;
    }

    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const [animals, total] = await Promise.all([
      Animal.find(query).sort({ name: 1 }).skip(skip).limit(limit),
      Animal.countDocuments(query),
    ]);

    return {
      animals,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    };
  }

  async getAnimalById(animalId, includeInactive = false) {
    const query = includeInactive ? { _id: animalId } : { _id: animalId, isActive: true };
    const animal = await Animal.findOne(query);
    if (!animal) throw ApiError.notFound('Animal not found');
    return animal;
  }

  async createAnimal(data, imageFile) {
    const normalizedData = this.normalizeAnimalPayload(data);
    if (imageFile) {
      normalizedData.imageUrl = `/uploads/animals/${imageFile.filename}`;
    }

    return Animal.create(normalizedData);
  }

  async updateAnimal(animalId, data, imageFile) {
    const animal = await Animal.findById(animalId);
    if (!animal) throw ApiError.notFound('Animal not found');

    const normalizedData = this.normalizeAnimalPayload(data);

    if (imageFile) {
      if (animal.imageUrl && animal.imageUrl.startsWith('/uploads/')) {
        this.deleteFile(animal.imageUrl);
      }
      normalizedData.imageUrl = `/uploads/animals/${imageFile.filename}`;
    }

    Object.assign(animal, normalizedData);
    await animal.save();
    return animal;
  }

  async deleteAnimal(animalId) {
    const animal = await Animal.findById(animalId);
    if (!animal) throw ApiError.notFound('Animal not found');

    animal.isActive = false;
    await animal.save();

    return { message: `Animal "${animal.name}" has been deactivated` };
  }

  normalizeAnimalPayload(data) {
    const normalizedData = { ...data };

    if ('isActive' in normalizedData) {
      normalizedData.isActive = normalizedData.isActive === true || normalizedData.isActive === 'true';
    }

    const zone = normalizedData['location[zone]'] ?? normalizedData.location?.zone ?? '';
    const x = normalizedData['location[coordinates][x]'] ?? normalizedData.location?.coordinates?.x ?? 0;
    const y = normalizedData['location[coordinates][y]'] ?? normalizedData.location?.coordinates?.y ?? 0;

    normalizedData.location = {
      zone,
      coordinates: {
        x: Number(x) || 0,
        y: Number(y) || 0,
      },
    };

    delete normalizedData['location[zone]'];
    delete normalizedData['location[coordinates][x]'];
    delete normalizedData['location[coordinates][y]'];

    return normalizedData;
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
}

export default new AnimalService();
