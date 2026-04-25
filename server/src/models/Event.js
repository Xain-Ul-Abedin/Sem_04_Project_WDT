import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      default: '',
    },
    venue: {
      type: String,
      default: 'Main Amphitheater',
    },
    category: {
      type: String,
      enum: ['feeding', 'show', 'educational', 'seasonal', 'special'],
      default: 'show',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ date: 1, isActive: 1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;
