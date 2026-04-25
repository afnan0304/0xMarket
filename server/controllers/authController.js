const bcrypt = require('bcryptjs')
const Session = require('../models/Session')
const User = require('../models/User')
const {
  PASSWORD_RESET_TOKEN_TTL_MS,
  SESSION_TTL_MS,
  VERIFICATION_TOKEN_TTL_MS,
  createAuthToken,
  clearAuthCookies,
  generateToken,
  hashToken,
  setCsrfCookie,
  setAuthCookies,
} = require('../lib/authSession')
const { sendPasswordResetEmail, sendVerificationEmail } = require('../lib/emailService')
const {
  validateEmailPayload,
  validateLoginPayload,
  validateRegistrationPayload,
  validateResetPayload,
} = require('../lib/authValidation')

const LOGIN_FAILURE_LIMIT = 5
const LOGIN_LOCK_MS = 15 * 60 * 1000
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role || 'buyer',
  ownedAssets: user.ownedAssets || [],
  purchasedAssets: user.ownedAssets || [],
  isVerified: Boolean(user.isVerified),
  lastLoginAt: user.lastLoginAt || null,
  lockedUntil: user.lockedUntil || null,
})

const buildSessionResponse = async (res, user, sessionContext = {}) => {
  const sessionToken = createAuthToken(user)
  const csrfToken = generateToken(32)
  const now = new Date()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await Session.create({
    user: user._id,
    sessionTokenHash: hashToken(sessionToken),
    csrfTokenHash: hashToken(csrfToken),
    userAgent: sessionContext.userAgent || null,
    ipAddress: sessionContext.ipAddress || null,
    expiresAt,
    lastUsedAt: now,
  })

  setAuthCookies(res, { sessionToken, csrfToken })

  return {
    csrfToken,
    sessionExpiresAt: expiresAt.toISOString(),
  }
}

const revokeCurrentSession = async (req) => {
  if (!req.session?._id) {
    return
  }

  await Session.findByIdAndUpdate(req.session._id, {
    revokedAt: new Date(),
  })
}

const revokeAllUserSessions = async (userId) => {
  await Session.updateMany(
    {
      user: userId,
      revokedAt: null,
    },
    {
      revokedAt: new Date(),
    },
  )
}

const register = async (req, res, next) => {
  try {
    const validation = validateRegistrationPayload(req.body || {})

    if (!validation.valid) {
      return res.status(400).json({ message: 'Validation failed.', errors: validation.errors })
    }

    const { username, email, password } = validation.values

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(409).json({ message: 'An account with those credentials already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const verificationToken = generateToken(24)

    const verificationTokenExpiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)

    const user = await User.create({
      username,
      email,
      password: passwordHash,
      role: 'buyer',
      isVerified: false,
      verificationTokenHash: hashToken(verificationToken),
      verificationTokenExpiresAt,
    })

    sendVerificationEmail({
      to: user.email,
      token: verificationToken,
      expiresAt: verificationTokenExpiresAt,
    }).catch((error) => {
      console.error(`Verification email send failed for ${user.email}: ${error.message}`)
    })

    return res.status(201).json({
      message: 'Account created. Verify your email to sign in.',
      requiresVerification: true,
      verificationToken: IS_PRODUCTION ? undefined : verificationToken,
      verificationExpiresAt: verificationTokenExpiresAt.toISOString(),
      user: sanitizeUser(user),
    })
  } catch (error) {
    return next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const validation = validateLoginPayload(req.body || {})

    if (!validation.valid) {
      return res.status(400).json({ message: 'Validation failed.', errors: validation.errors })
    }

    const { identifier, identifierType, password } = validation.values

    const query = identifierType === 'email' ? { email: identifier } : { username: identifier }

    const user = await User.findOne(query).select(
      '+password +failedLoginAttempts +lockedUntil +verificationTokenHash +verificationTokenExpiresAt +isVerified',
    )

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({ message: 'Account is temporarily locked. Try again later.' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1

      if (user.failedLoginAttempts >= LOGIN_FAILURE_LIMIT) {
        user.lockedUntil = new Date(Date.now() + LOGIN_LOCK_MS)
        user.failedLoginAttempts = LOGIN_FAILURE_LIMIT
      }

      await user.save()
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before signing in.',
        requiresVerification: true,
      })
    }

    user.failedLoginAttempts = 0
    user.lockedUntil = null
    user.lastLoginAt = new Date()
    await user.save()

    await buildSessionResponse(res, user, {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    })

    return res.status(200).json({
      message: 'Login successful.',
      user: sanitizeUser(user),
    })
  } catch (error) {
    return next(error)
  }
}

const me = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    return res.status(200).json({ user: sanitizeUser(req.user) })
  } catch (error) {
    return next(error)
  }
}

const verifyEmail = async (req, res, next) => {
  try {
    const token = String(req.body?.token || req.body?.verificationToken || '').trim()

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' })
    }

    const user = await User.findOne({
      verificationTokenHash: hashToken(token),
      verificationTokenExpiresAt: { $gt: new Date() },
    }).select('+verificationTokenHash +verificationTokenExpiresAt')

    if (!user) {
      return res.status(400).json({ message: 'Verification token is invalid or expired.' })
    }

    user.isVerified = true
    user.verificationTokenHash = null
    user.verificationTokenExpiresAt = null
    await user.save()

    await buildSessionResponse(res, user, {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    })

    return res.status(200).json({
      message: 'Email verified successfully.',
      user: sanitizeUser(user),
    })
  } catch (error) {
    return next(error)
  }
}

const requestVerification = async (req, res, next) => {
  try {
    const validation = validateEmailPayload(req.body || {})

    if (!validation.valid) {
      return res.status(400).json({ message: 'Validation failed.', errors: validation.errors })
    }

    const { email } = validation.values
    const user = await User.findOne({ email }).select(
      '+verificationTokenHash +verificationTokenExpiresAt +isVerified',
    )

    if (!user || user.isVerified) {
      return res.status(200).json({ message: 'If the account exists, a verification email has been prepared.' })
    }

    const verificationToken = generateToken(24)
    user.verificationTokenHash = hashToken(verificationToken)
    user.verificationTokenExpiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)
    await user.save()

    sendVerificationEmail({
      to: user.email,
      token: verificationToken,
      expiresAt: user.verificationTokenExpiresAt,
    }).catch((error) => {
      console.error(`Verification email resend failed for ${user.email}: ${error.message}`)
    })

    return res.status(200).json({
      message: 'If the account exists, a verification email has been prepared.',
      verificationToken: IS_PRODUCTION ? undefined : verificationToken,
      verificationExpiresAt: IS_PRODUCTION ? undefined : user.verificationTokenExpiresAt.toISOString(),
    })
  } catch (error) {
    return next(error)
  }
}

const requestPasswordReset = async (req, res, next) => {
  try {
    const validation = validateEmailPayload(req.body || {})

    if (!validation.valid) {
      return res.status(400).json({ message: 'Validation failed.', errors: validation.errors })
    }

    const { email } = validation.values
    const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetTokenExpiresAt')

    if (user) {
      const resetToken = generateToken(24)
      user.passwordResetTokenHash = hashToken(resetToken)
      user.passwordResetTokenExpiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS)
      await user.save()

      sendPasswordResetEmail({
        to: user.email,
        token: resetToken,
        expiresAt: user.passwordResetTokenExpiresAt,
      }).catch((error) => {
        console.error(`Password reset email send failed for ${user.email}: ${error.message}`)
      })

      return res.status(200).json({
        message: 'If the account exists, a password reset link has been prepared.',
        resetToken: IS_PRODUCTION ? undefined : resetToken,
        resetExpiresAt: IS_PRODUCTION ? undefined : user.passwordResetTokenExpiresAt.toISOString(),
      })
    }

    return res.status(200).json({ message: 'If the account exists, a password reset link has been prepared.' })
  } catch (error) {
    return next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const validation = validateResetPayload(req.body || {})

    if (!validation.valid) {
      return res.status(400).json({ message: 'Validation failed.', errors: validation.errors })
    }

    const { token, password } = validation.values
    const user = await User.findOne({
      passwordResetTokenHash: hashToken(token),
      passwordResetTokenExpiresAt: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetTokenExpiresAt +failedLoginAttempts +lockedUntil +password')

    if (!user) {
      return res.status(400).json({ message: 'Reset token is invalid or expired.' })
    }

    user.password = await bcrypt.hash(password, 12)
    user.passwordResetTokenHash = null
    user.passwordResetTokenExpiresAt = null
    user.failedLoginAttempts = 0
    user.lockedUntil = null
    user.lastLoginAt = new Date()
    await user.save()

    await revokeAllUserSessions(user._id)

    await buildSessionResponse(res, user, {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    })

    return res.status(200).json({
      message: 'Password reset successful.',
      user: sanitizeUser(user),
    })
  } catch (error) {
    return next(error)
  }
}

const clearAuthSession = async (req, res, next) => {
  try {
    await revokeCurrentSession(req)
    clearAuthCookies(res)

    return res.status(200).json({
      message: 'Logged out successfully.',
    })
  } catch (error) {
    return next(error)
  }
}

const getCsrfToken = async (_req, res, next) => {
  try {
    const csrfToken = generateToken(32)
    setCsrfCookie(res, csrfToken)

    return res.status(200).json({ csrfToken })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  register,
  login,
  logout: clearAuthSession,
  me,
  verifyEmail,
  requestVerification,
  requestPasswordReset,
  resetPassword,
  getCsrfToken,
}
