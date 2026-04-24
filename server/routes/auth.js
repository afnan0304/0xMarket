const express = require('express')
const {
	register,
	login,
	logout,
	me,
	verifyEmail,
	requestVerification,
	requestPasswordReset,
	resetPassword,
	getCsrfToken,
} = require('../controllers/authController')
const authGuard = require('../middleware/authGuard')
const {
	loginLimiter,
	registerLimiter,
	verificationLimiter,
	passwordResetLimiter,
} = require('../middleware/rateLimiter')
const csrfGuard = require('../middleware/csrfGuard')

const router = express.Router()

router.post('/register', registerLimiter, register)
router.post('/login', loginLimiter, login)
router.post('/verify-email', verificationLimiter, verifyEmail)
router.post('/request-verification', verificationLimiter, requestVerification)
router.post('/request-password-reset', passwordResetLimiter, requestPasswordReset)
router.post('/reset-password', passwordResetLimiter, resetPassword)
router.get('/csrf', getCsrfToken)
router.post('/logout', authGuard, csrfGuard, logout)
router.get('/me', authGuard, me)

module.exports = router
