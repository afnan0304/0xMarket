const rateLimit = require('express-rate-limit')

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message,
    },
  })

const loginLimiter = createLimiter(60 * 1000, 5, 'Too many login attempts. Try again in a minute.')
const registerLimiter = createLimiter(60 * 1000, 3, 'Too many registration attempts. Try again in a minute.')
const verificationLimiter = createLimiter(60 * 1000, 5, 'Too many verification attempts. Try again in a minute.')
const passwordResetLimiter = createLimiter(60 * 1000, 3, 'Too many password reset attempts. Try again in a minute.')
const geminiLimiter = createLimiter(60 * 1000, 5, 'Too many Gemini requests. Please wait and retry.')

module.exports = {
  loginLimiter,
  registerLimiter,
  verificationLimiter,
  passwordResetLimiter,
  geminiLimiter,
}
