import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'],
      default: 'in_stock',
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ businessId: 1, sku: 1 });
productSchema.index({ businessId: 1, name: 1 });

// Helper to determine product status from stock level
productSchema.pre('save', function (next) {
  if (this.status !== 'discontinued') {
    if (this.stock <= 0) {
      this.status = 'out_of_stock';
    } else if (this.stock <= this.lowStockThreshold) {
      this.status = 'low_stock';
    } else {
      this.status = 'in_stock';
    }
  }
  next();
});

export default mongoose.model('Product', productSchema);
