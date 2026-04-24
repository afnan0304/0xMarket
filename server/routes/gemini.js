const express = require('express')
const { sendPrompt } = require('../controllers/geminiController')
const { geminiLimiter } = require('../middleware/rateLimiter')

const router = express.Router()

router.post('/', geminiLimiter, sendPrompt)

module.exports = router
