const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()
const normalizeUsername = (value) => String(value || '').trim()
const normalizeIdentifier = (value) => String(value || '').trim()

const getPasswordError = (password) => {
  if (typeof password !== 'string') {
    return 'Password is required.'
  }

  if (password.length < 12) {
    return 'Password must be at least 12 characters long.'
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return 'Password must include letters, numbers, and a symbol.'
  }

  return null
}

const validateRegistrationPayload = (payload = {}) => {
  const errors = {}
  const username = normalizeUsername(payload.username)
  const email = normalizeEmail(payload.email)
  const password = typeof payload.password === 'string' ? payload.password : ''
  const confirmPassword = typeof payload.confirmPassword === 'string' ? payload.confirmPassword : ''

  if (!username) {
    errors.username = 'Username is required.'
  } else if (username.length < 3 || username.length > 32) {
    errors.username = 'Username must be between 3 and 32 characters.'
  } else if (!USERNAME_PATTERN.test(username)) {
    errors.username = 'Username can only contain letters, numbers, dots, underscores, and hyphens.'
  }

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Email format is invalid.'
  }

  const passwordError = getPasswordError(password)
  if (passwordError) {
    errors.password = passwordError
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      username,
      email,
      password,
    },
  }
}

const validateLoginPayload = (payload = {}) => {
  const errors = {}
  const identifier = normalizeIdentifier(payload.identifier || payload.email || payload.username)
  const password = typeof payload.password === 'string' ? payload.password : ''

  if (!identifier) {
    errors.identifier = 'Email or username is required.'
  }

  if (typeof password !== 'string' || !password) {
    errors.password = 'Password is required.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      identifier,
      password,
      identifierType: identifier.includes('@') ? 'email' : 'username',
    },
  }
}

const validateEmailPayload = (payload = {}) => {
  const errors = {}
  const email = normalizeEmail(payload.email || payload.identifier)

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Email format is invalid.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      email,
    },
  }
}

const validateResetPayload = (payload = {}) => {
  const errors = {}
  const token = normalizeIdentifier(payload.token)
  const password = typeof payload.password === 'string' ? payload.password : ''
  const confirmPassword = typeof payload.confirmPassword === 'string' ? payload.confirmPassword : ''

  if (!token) {
    errors.token = 'Token is required.'
  }

  const passwordError = getPasswordError(password)
  if (passwordError) {
    errors.password = passwordError
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      token,
      password,
    },
  }
}

module.exports = {
  EMAIL_PATTERN,
  USERNAME_PATTERN,
  normalizeEmail,
  normalizeUsername,
  normalizeIdentifier,
  validateRegistrationPayload,
  validateLoginPayload,
  validateEmailPayload,
  validateResetPayload,
}