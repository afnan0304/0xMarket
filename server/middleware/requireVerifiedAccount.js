const requireVerifiedAccount = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ message: 'Please verify your email before continuing.' })
  }

  return next()
}

module.exports = requireVerifiedAccount