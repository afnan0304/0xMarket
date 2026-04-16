const express = require('express')
const mongoose = require('mongoose')
const Asset = require('../models/Asset')

const router = express.Router()

router.get('/', async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is not connected. Configure MONGO_URI and restart the server.',
    })
  }

  try {
    const assets = await Asset.find({}).sort({ createdAt: -1 })
    return res.status(200).json({ assets })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch assets.',
      error: error.message,
    })
  }
})

module.exports = router
