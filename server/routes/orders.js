const express = require('express')
const { checkout } = require('../controllers/orderController')
const authGuard = require('../middleware/authGuard')
const csrfGuard = require('../middleware/csrfGuard')
const requireVerifiedAccount = require('../middleware/requireVerifiedAccount')

const router = express.Router()

router.post('/checkout', authGuard, csrfGuard, requireVerifiedAccount, checkout)

module.exports = router
