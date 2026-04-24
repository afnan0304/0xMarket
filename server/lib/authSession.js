const crypto = require('crypto')

const SESSION_COOKIE_NAME = 'market_session'
const CSRF_COOKIE_NAME = 'market_csrf'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000

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
  setAuthCookies,
  setCsrfCookie,
  clearAuthCookies,
}