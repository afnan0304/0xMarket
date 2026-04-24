#!/usr/bin/env node

/*
 * Auth smoke test for secure session flows.
 *
 * Requirements:
 * - Server running (default http://localhost:5000)
 * - MongoDB connected (user/session writes required)
 * - NODE_ENV not production for token-return assertions
 */

const BASE_URL = (process.env.SMOKE_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')

const cookieJar = {}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const parseSetCookie = (setCookieHeader) => {
  const headers = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : setCookieHeader
      ? [setCookieHeader]
      : []

  for (const header of headers) {
    const firstPart = String(header).split(';')[0]
    const index = firstPart.indexOf('=')
    if (index <= 0) {
      continue
    }
    const name = firstPart.slice(0, index)
    const value = firstPart.slice(index + 1)
    cookieJar[name] = value
  }
}

const getCookieHeader = () => {
  const entries = Object.entries(cookieJar)
  if (entries.length === 0) {
    return ''
  }

  return entries.map(([name, value]) => `${name}=${value}`).join('; ')
}

const requestJson = async (path, { method = 'GET', body, headers = {} } = {}) => {
  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  const cookieHeader = getCookieHeader()
  if (cookieHeader) {
    requestHeaders.Cookie = cookieHeader
  }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  parseSetCookie(response.headers.getSetCookie?.() || response.headers.get('set-cookie'))

  const raw = await response.text()
  let data = null
  if (raw) {
    try {
      data = JSON.parse(raw)
    } catch (_error) {
      data = { raw }
    }
  }

  return { response, data }
}

const run = async () => {
  const seed = Date.now()
  const email = `smoke.${seed}@example.test`
  const username = `smoke_${seed}`
  const password = 'Str0ng!Passw0rd#1'
  const nextPassword = 'An0ther!Strong#Pass2'

  console.log(`Running auth smoke test against ${BASE_URL}`)

  const register = await requestJson('/api/auth/register', {
    method: 'POST',
    body: {
      username,
      email,
      password,
      confirmPassword: password,
    },
  })
  assert(
    register.response.status === 201,
    `register expected 201, got ${register.response.status}. response=${JSON.stringify(register.data)}`,
  )
  assert(register.data?.requiresVerification === true, 'register should require verification')
  assert(register.data?.verificationToken, 'register should return verificationToken in non-production')
  console.log('PASS register')

  const meBeforeVerify = await requestJson('/api/auth/me')
  assert(
    meBeforeVerify.response.status === 401,
    `me-before-verify expected 401, got ${meBeforeVerify.response.status}. response=${JSON.stringify(meBeforeVerify.data)}`,
  )
  console.log('PASS me unauthorized before verify')

  const verify = await requestJson('/api/auth/verify-email', {
    method: 'POST',
    body: {
      token: register.data.verificationToken,
    },
  })
  assert(verify.response.status === 200, `verify expected 200, got ${verify.response.status}. response=${JSON.stringify(verify.data)}`)
  assert(verify.data?.user?.isVerified === true, 'verify response should indicate verified user')
  console.log('PASS verify-email')

  const meAfterVerify = await requestJson('/api/auth/me')
  assert(
    meAfterVerify.response.status === 200,
    `me-after-verify expected 200, got ${meAfterVerify.response.status}. response=${JSON.stringify(meAfterVerify.data)}`,
  )
  console.log('PASS me authorized after verify')

  const logoutWithoutCsrf = await requestJson('/api/auth/logout', { method: 'POST' })
  assert(
    logoutWithoutCsrf.response.status === 403,
    `logout without csrf expected 403, got ${logoutWithoutCsrf.response.status}. response=${JSON.stringify(logoutWithoutCsrf.data)}`,
  )
  console.log('PASS logout blocked without csrf')

  const csrfToken = cookieJar.market_csrf
  assert(csrfToken, 'csrf cookie market_csrf should exist after verify')

  const logout = await requestJson('/api/auth/logout', {
    method: 'POST',
    headers: {
      'x-csrf-token': csrfToken,
    },
  })
  assert(logout.response.status === 200, `logout expected 200, got ${logout.response.status}. response=${JSON.stringify(logout.data)}`)
  console.log('PASS logout with csrf')

  const login = await requestJson('/api/auth/login', {
    method: 'POST',
    body: {
      email,
      password,
    },
  })
  assert(login.response.status === 200, `login expected 200, got ${login.response.status}. response=${JSON.stringify(login.data)}`)
  console.log('PASS login')

  const requestReset = await requestJson('/api/auth/request-password-reset', {
    method: 'POST',
    body: {
      email,
    },
  })
  assert(
    requestReset.response.status === 200,
    `request-password-reset expected 200, got ${requestReset.response.status}. response=${JSON.stringify(requestReset.data)}`,
  )
  assert(requestReset.data?.resetToken, 'request-password-reset should return resetToken in non-production')
  console.log('PASS request-password-reset')

  const reset = await requestJson('/api/auth/reset-password', {
    method: 'POST',
    body: {
      token: requestReset.data.resetToken,
      password: nextPassword,
      confirmPassword: nextPassword,
    },
  })
  assert(reset.response.status === 200, `reset-password expected 200, got ${reset.response.status}. response=${JSON.stringify(reset.data)}`)
  console.log('PASS reset-password')

  const loginWithOldPassword = await requestJson('/api/auth/login', {
    method: 'POST',
    body: {
      email,
      password,
    },
  })
  assert(
    loginWithOldPassword.response.status === 401,
    `old-password login expected 401, got ${loginWithOldPassword.response.status}. response=${JSON.stringify(loginWithOldPassword.data)}`,
  )
  console.log('PASS old password rejected')

  const loginWithNewPassword = await requestJson('/api/auth/login', {
    method: 'POST',
    body: {
      email,
      password: nextPassword,
    },
  })
  assert(
    loginWithNewPassword.response.status === 200,
    `new-password login expected 200, got ${loginWithNewPassword.response.status}. response=${JSON.stringify(loginWithNewPassword.data)}`,
  )
  console.log('PASS new password accepted')

  console.log('Auth smoke test completed successfully.')
}

run().catch((error) => {
  console.error(`Auth smoke test failed: ${error.message}`)
  process.exit(1)
})
