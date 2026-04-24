const { CSRF_COOKIE_NAME, hashToken } = require('../lib/authSession')

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

const csrfGuard = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next()
  }

  if (!req.session) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  const headerToken = req.get('x-csrf-token')
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME]

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ message: 'CSRF validation failed.' })
  }

  if (hashToken(headerToken) !== req.session.csrfTokenHash) {
    return res.status(403).json({ message: 'CSRF validation failed.' })
  }

  return next()
}

module.exports = csrfGuard