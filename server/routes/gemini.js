const express = require('express')

const router = express.Router()

router.post('/', (req, res) => {
  const { prompt } = req.body || {}

  res.status(200).json({
    status: 'Gemini route placeholder',
    receivedPrompt: prompt || null,
  })
})

module.exports = router
