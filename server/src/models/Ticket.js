import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ticket name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      default: '',
    },
    includes: {
      type: [String],
      default: ['Zoo Entry'],
    },
    maxPerBooking: {
      type: Number,
      default: 10,
      min: [1, 'Max per booking must be at least 1'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
