const Session = require('../models/Session')
const { SESSION_COOKIE_NAME, clearAuthCookies, hashToken, verifyAuthToken } = require('../lib/authSession')

const authGuard = async (req, res, next) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME]

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  try {
    let decodedToken = null

    try {
      decodedToken = verifyAuthToken(token)
    } catch (_error) {
      decodedToken = null
    }

    const session = await Session.findOne({
      sessionTokenHash: hashToken(token),
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).populate('user', 'username email ownedAssets role isVerified lockedUntil lastLoginAt')

    if (!session || !session.user) {
      clearAuthCookies(res)
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (decodedToken?.sub && String(decodedToken.sub) !== String(session.user._id)) {
      clearAuthCookies(res)
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (session.user.lockedUntil && session.user.lockedUntil > new Date()) {
      return res.status(423).json({ message: 'Account is temporarily locked. Try again later.' })
    }

    req.session = session
    req.user = {
      _id: session.user._id,
      username: session.user.username,
      email: session.user.email,
      role: session.user.role || 'buyer',
      ownedAssets: session.user.ownedAssets || [],
      purchasedAssets: session.user.ownedAssets || [],
      isVerified: Boolean(session.user.isVerified),
      lastLoginAt: session.user.lastLoginAt || null,
      lockedUntil: session.user.lockedUntil || null,
    }

    session.lastUsedAt = new Date()
    session.save().catch(() => {})

    return next()
  } catch (_error) {
    clearAuthCookies(res)
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

module.exports = authGuard
