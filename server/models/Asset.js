const mongoose = require('mongoose')

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    btcPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model('Asset', assetSchema)
