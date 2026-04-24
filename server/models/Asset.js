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
    downloadUrl: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model('Asset', assetSchema)
