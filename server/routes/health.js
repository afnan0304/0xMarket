const express = require('express')
const mongoose = require('mongoose')

const router = express.Router()

const dbStateMap = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
}

router.get('/', (_req, res) => {
  const readyState = mongoose.connection.readyState

  res.status(200).json({
    status: 'System Online',
    database: dbStateMap[readyState] || 'unknown',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

module.exports = router
