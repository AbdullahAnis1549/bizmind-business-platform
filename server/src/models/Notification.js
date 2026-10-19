import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['low_stock', 'new_order', 'payment_received', 'invoice_overdue', 'team_invite', 'system'],
      default: 'system',
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ businessId: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
