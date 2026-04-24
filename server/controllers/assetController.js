const mongoose = require('mongoose')
const Asset = require('../models/Asset')
const fallbackAssets = require('../data/fallbackAssets')

const getAssets = async (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(200).json({
      assets: fallbackAssets,
      source: 'fallback',
      message: 'Database is not connected. Showing fallback inventory.',
    })
  }

  try {
    const assets = await Asset.find({}).sort({ createdAt: -1 })

    if (assets.length === 0) {
      return res.status(200).json({
        assets: fallbackAssets,
        source: 'fallback-empty',
        message: 'No assets in database. Showing fallback inventory.',
      })
    }

    return res.status(200).json({ assets, source: 'database' })
  } catch (error) {
    return next(error)
  }
}

const downloadAsset = async (req, res, next) => {
  try {
    const { assetId } = req.params
    const asset = await Asset.findById(assetId).select('name downloadUrl isEncrypted')

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found.' })
    }

    if (!asset.downloadUrl) {
      return res.status(404).json({ message: 'Download is not available for this asset.' })
    }

    return res.status(200).json({
      assetId: asset._id,
      assetName: asset.name,
      downloadUrl: asset.downloadUrl,
      isEncrypted: asset.isEncrypted,
      message: 'Authorized download granted.',
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getAssets,
  downloadAsset,
}
