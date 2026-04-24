const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },
    totalBtc: {
      type: Number,
      required: true,
      min: 0,
    },
    discountCode: {
      type: String,
      trim: true,
      default: null,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    paymentRail: {
      type: String,
      trim: true,
      default: null,
    },
    alias: {
      type: String,
      trim: true,
      default: null,
    },
    wallet: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model('Order', orderSchema)
