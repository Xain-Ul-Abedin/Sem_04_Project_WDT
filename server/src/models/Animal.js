import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Animal name is required'],
      trim: true,
    },
    species: {
      type: String,
      required: [true, 'Species is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['mammal', 'bird', 'reptile', 'aquatic', 'insect'],
        message: 'Category must be one of: mammal, bird, reptile, aquatic, insect',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    habitat: {
      type: String,
      default: '',
    },
    diet: {
      type: String,
      default: '',
    },
    funFact: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    location: {
      zone: { type: String, default: '' },
      coordinates: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
      },
    },
    conservationStatus: {
      type: String,
      enum: ['Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered', 'Critically Endangered', 'Extinct in Wild', ''],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for search functionality
animalSchema.index({ name: 'text', species: 'text', description: 'text' });
animalSchema.index({ category: 1, isActive: 1 });

const Animal = mongoose.model('Animal', animalSchema);
export default Animal;
