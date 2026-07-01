const mongoose = require('mongoose');

// ─── Sub-schema: individual line item within an order ────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Order item must reference a product']
    },
    name: {
      type: String,
      required: [true, 'Order item name is required'],
      trim: true
    },
    sku: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      required: [true, 'Order item quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Order item price is required'],
      min: [0, 'Price must be a non-negative number']
    }
  },
  { _id: false }
);

// ─── Sub-schema: shipping address snapshot ───────────────────────────────────
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required for shipping'],
      trim: true
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true
    },
    addressLine2: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    }
  },
  { _id: false }
);

// ─── Main Order schema ────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      // Auto-generated before save (see pre-save hook below)
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user']
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (val) => val.length > 0,
        message: 'An order must contain at least one item'
      }
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, 'Please provide a valid phone number']
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['cod', 'razorpay', 'upi', 'netbanking', 'card'],
        message: 'Payment method must be one of: cod, razorpay, upi, netbanking, card'
      }
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount must be a non-negative number']
    },
    orderStatus: {
      type: String,
      enum: {
        values: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        message:
          'Order status must be one of: placed, confirmed, processing, shipped, delivered, cancelled'
      },
      default: 'placed'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// ─── Pre-save hook: generate a human-readable unique orderId ─────────────────
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderId = `SAF-${timestamp}-${random}`;
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
orderSchema.index({ orderId: 1 }, { unique: true });
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
