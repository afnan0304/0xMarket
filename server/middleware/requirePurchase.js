const mongoose = require('mongoose')
const User = require('../models/User')

const requirePurchase = async (req, res, next) => {
  const { assetId } = req.params

  if (!mongoose.Types.ObjectId.isValid(assetId)) {
    return res.status(400).json({ message: 'Invalid asset ID.' })
  }

  try {
    const userId = req.user?._id || req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    const user = await User.findById(userId).select('ownedAssets')

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    const ownsAsset = user.ownedAssets.some((ownedAssetId) => ownedAssetId.equals(assetId))

    if (!ownsAsset) {
      return res.status(403).json({ message: 'Purchase required before download.' })
    }

    return next()
  } catch (error) {
    return next(error)
  }
}

module.exports = requirePurchase
