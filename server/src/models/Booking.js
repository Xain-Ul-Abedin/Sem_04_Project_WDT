import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    bookingRef: {
      type: String,
      unique: true,
      required: true,
    },
    visitDate: {
      type: Date,
      required: [true, 'Visit date is required'],
    },
    tickets: [
      {
        ticketType: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ticket',
          required: true,
        },
        ticketName: String,   // Snapshot at booking time
        unitPrice: Number,    // Snapshot at booking time (B13)
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    totalVisitors: {
      type: Number,
      required: true,
      min: [1, 'Must have at least 1 visitor'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['visa', 'mastercard', 'jazzcash', 'easypaisa', 'cash_on_arrival', ''],
      default: '',
    },
    visitors: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true, min: 0 },
        type: {
          type: String,
          enum: ['adult', 'child', 'senior'],
          required: true,
        },
      },
    ],
    specialRequests: {
      type: String,
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1, visitDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
