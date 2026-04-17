const express = require('express')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const router = express.Router()

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
const GEMINI_SYSTEM_INSTRUCTION = [
  'You are the Black Market Dealer in a fictional terminal marketplace.',
  'Keep the tone terse, sharp, and a little mysterious.',
  'Respond like an in-character dealer giving market banter, not like a generic assistant.',
  'Do not provide instructions for real-world crime, violence, malware, theft, or evading law enforcement.',
  'If the request is unsafe or actionable, refuse briefly and offer a safe fictional alternative.',
].join(' ')

const geminiApiKey = process.env.GEMINI_API_KEY
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null
const model = genAI
  ? genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
    })
  : null

router.post('/', async (req, res) => {
  const { prompt } = req.body || {}
  const promptText = typeof prompt === 'string' ? prompt.trim() : ''

  if (!promptText) {
    return res.status(400).json({
      message: 'Prompt is required.',
    })
  }

  if (!model) {
    return res.status(500).json({
      message: 'GEMINI_API_KEY is not configured on the server.',
    })
  }

  try {
    const result = await model.generateContent(promptText)
    const replyText = result?.response?.text?.() || ''
    const reply = replyText.trim()

    return res.status(200).json({
      reply: reply || 'The dealer stays quiet. Try another signal.',
      model: GEMINI_MODEL,
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Gemini request failed.',
    })
  }
})

module.exports = router
