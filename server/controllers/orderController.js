const mongoose = require('mongoose')
const Asset = require('../models/Asset')
const Order = require('../models/Order')
const User = require('../models/User')

const parseDiscountCodes = () => {
  const rawCodes = process.env.SECRET_DISCOUNT_CODES || 'NULLBYTE:15,BLACKICE:25,SUDO:10'

  return rawCodes
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const [code, percentText] = entry.split(':')
      const parsedPercent = Number(percentText)

      if (!code || Number.isNaN(parsedPercent) || parsedPercent < 0 || parsedPercent > 100) {
        return acc
      }

      acc[code.trim().toUpperCase()] = parsedPercent
      return acc
    }, {})
}

const ensureDatabaseReady = () => {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error('Checkout requires an active database connection.')
    error.statusCode = 503
    throw error
  }
}

const checkout = async (req, res, next) => {
  try {
    ensureDatabaseReady()
    const userId = req.user?._id || req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    const { assetIds, discountCode, paymentRail, alias, wallet } = req.body || {}

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return res.status(400).json({ message: 'assetIds must be a non-empty array.' })
    }

    const uniqueAssetIds = [...new Set(assetIds)].filter((id) => mongoose.Types.ObjectId.isValid(id))

    if (uniqueAssetIds.length !== assetIds.length) {
      return res.status(400).json({ message: 'One or more asset IDs are invalid.' })
    }

    const assets = await Asset.find({ _id: { $in: uniqueAssetIds } }).select('btcPrice name')

    if (assets.length !== uniqueAssetIds.length) {
      return res.status(404).json({ message: 'Some assets were not found.' })
    }

    const subtotal = assets.reduce((sum, asset) => sum + asset.btcPrice, 0)
    const discountMap = parseDiscountCodes()
    const normalizedCode = typeof discountCode === 'string' ? discountCode.trim().toUpperCase() : ''
    const discountPercent = normalizedCode ? discountMap[normalizedCode] || 0 : 0

    const totalSpent = Number((subtotal * (1 - discountPercent / 100)).toFixed(8))

    const order = await Order.create({
      userId,
      items: assets.map((asset) => asset._id),
      status: 'Pending',
      totalSpent,
      discountCode: normalizedCode || null,
      discountPercent,
      paymentRail: paymentRail || null,
      alias: alias || null,
      wallet: wallet || null,
    })

    order.status = 'Completed'
    await order.save()

    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        ownedAssets: {
          $each: assets.map((asset) => asset._id),
        },
      },
    })

    return res.status(200).json({
      message: 'Checkout completed.',
      order: {
        id: order._id,
        status: order.status,
        totalBtc: totalSpent,
        totalSpent,
        discountPercent,
      },
      purchasedAssets: assets.map((asset) => ({
        id: asset._id,
        name: asset.name,
      })),
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  checkout,
}
