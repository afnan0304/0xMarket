const express = require('express')
const { getAssets, downloadAsset } = require('../controllers/assetController')
const authGuard = require('../middleware/authGuard')
const requirePurchase = require('../middleware/requirePurchase')

const router = express.Router()

router.get('/assets', getAssets)
router.get('/download/:assetId', authGuard, requirePurchase, downloadAsset)

module.exports = router
