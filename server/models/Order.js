const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    totalSpent: {
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

const userVirtual = orderSchema.virtual('user')
userVirtual.get(function userGetter() {
  return this.userId
})

const assetsVirtual = orderSchema.virtual('assets')
assetsVirtual.get(function assetsGetter() {
  return this.items
})

const totalBtcVirtual = orderSchema.virtual('totalBtc')
totalBtcVirtual.get(function totalBtcGetter() {
  return this.totalSpent
})

orderSchema.set('toJSON', { virtuals: true })
orderSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Order', orderSchema)
