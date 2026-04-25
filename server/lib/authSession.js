const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const SESSION_COOKIE_NAME = 'market_session'
const CSRF_COOKIE_NAME = 'market_csrf'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000
const AUTH_JWT_SECRET = process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET || '0xmarket-dev-auth-secret'
const AUTH_JWT_TTL = process.env.AUTH_JWT_TTL || `${Math.floor(SESSION_TTL_MS / 1000)}s`

const generateToken = (size = 32) => crypto.randomBytes(size).toString('hex')

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex')

const getCookieBaseOptions = () => ({
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
})

const getSessionCookieOptions = () => ({
  ...getCookieBaseOptions(),
  httpOnly: true,
  maxAge: SESSION_TTL_MS,
})

const getCsrfCookieOptions = () => ({
  ...getCookieBaseOptions(),
  httpOnly: false,
  maxAge: SESSION_TTL_MS,
})

const setCsrfCookie = (res, csrfToken) => {
  res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions())
}

const setAuthCookies = (res, { sessionToken, csrfToken }) => {
  res.cookie(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions())
  res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions())
}

const createAuthToken = (user) =>
  jwt.sign(
    {
      email: user.email,
      role: user.role || 'buyer',
    },
    AUTH_JWT_SECRET,
    {
      subject: String(user._id),
      expiresIn: AUTH_JWT_TTL,
    },
  )

const verifyAuthToken = (token) => jwt.verify(token, AUTH_JWT_SECRET)

const clearAuthCookies = (res) => {
  const clearOptions = getCookieBaseOptions()
  res.clearCookie(SESSION_COOKIE_NAME, clearOptions)
  res.clearCookie(CSRF_COOKIE_NAME, clearOptions)
}

module.exports = {
  SESSION_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  SESSION_TTL_MS,
  VERIFICATION_TOKEN_TTL_MS,
  PASSWORD_RESET_TOKEN_TTL_MS,
  generateToken,
  hashToken,
  createAuthToken,
  verifyAuthToken,
  setAuthCookies,
  setCsrfCookie,
  clearAuthCookies,
}