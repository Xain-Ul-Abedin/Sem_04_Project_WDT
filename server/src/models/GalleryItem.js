import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL/path is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['animals', 'events', 'habitat', 'aerial', 'visitors'],
        message: 'Category must be one of: animals, events, habitat, aerial, visitors',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    photographer: {
      type: String,
      default: 'Lahore Zoo',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

galleryItemSchema.index({ category: 1, isActive: 1 });
galleryItemSchema.index({ isFeatured: 1 });

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
export default GalleryItem;
