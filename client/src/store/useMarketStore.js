import { create } from 'zustand'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const ASSETS_PATH = import.meta.env.VITE_ASSETS_ENDPOINT || '/api/assets'
const CSRF_COOKIE_NAME = 'market_csrf'
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

const buildUrl = (path) => `${API_BASE_URL}${path}`

const getCookieValue = (name) => {
  if (typeof document === 'undefined') {
    return ''
  }

  const encodedName = `${encodeURIComponent(name)}=`
  const cookieParts = String(document.cookie || '').split('; ')
  const target = cookieParts.find((part) => part.startsWith(encodedName))

  if (!target) {
    return ''
  }

  return decodeURIComponent(target.slice(encodedName.length))
}

const parseJsonResponse = async (response) => {
  const raw = await response.text()

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch (_error) {
    return null
  }
}

const createApiError = (response, data) => {
  const error = new Error(data?.message || `Request failed with status ${response.status}`)
  error.status = response.status
  error.payload = data
  return error
}

const apiRequest = async (path, options = {}) => {
  const method = String(options.method || 'GET').toUpperCase()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (!SAFE_METHODS.has(method) && options.requireCsrf) {
    const csrfToken = getCookieValue(CSRF_COOKIE_NAME)

    if (!csrfToken) {
      throw new Error('Security token missing. Refresh and try again.')
    }

    headers['x-csrf-token'] = csrfToken
  }

  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    ...options,
    headers,
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw createApiError(response, data)
  }

  return data
}

const toErrorMessage = (error, fallback) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const useMarketStore = create((set, get) => ({
  assets: [],
  assetsSource: null,
  assetsMessage: null,
  assetsLoading: false,
  assetsError: null,
  cartAssetIds: [],
  cartDiscountCode: null,
  cartDiscountPercent: 0,
  health: null,
  healthLoading: false,
  healthError: null,
  prompt: '',
  geminiResult: null,
  geminiLoading: false,
  geminiError: null,
  authUser: null,
  authLoading: false,
  authError: null,
  authRequiresVerification: false,
  authVerificationEmail: null,
  authVerificationToken: null,
  authResetToken: null,
  checkoutResult: null,
  checkoutLoading: false,
  checkoutError: null,
  downloadLoadingAssetId: null,

  setPrompt: (prompt) => set({ prompt }),
  clearCheckoutResult: () => set({ checkoutResult: null, checkoutError: null }),
  clearAuthError: () => set({ authError: null }),
  addToCart: (assetId) => {
    const normalizedAssetId = String(assetId || '').trim()

    if (!normalizedAssetId) {
      return false
    }

    if (get().cartAssetIds.includes(normalizedAssetId)) {
      return false
    }

    set((state) => ({
      cartAssetIds: [...state.cartAssetIds, normalizedAssetId],
    }))

    return true
  },
  removeFromCart: (assetId) => {
    const normalizedAssetId = String(assetId || '').trim()
    set((state) => ({
      cartAssetIds: state.cartAssetIds.filter((id) => id !== normalizedAssetId),
    }))
  },
  clearCart: () => set({ cartAssetIds: [], cartDiscountCode: null, cartDiscountPercent: 0 }),
  applyCartDiscount: ({ code, percent }) => {
    const normalizedCode = String(code || '').trim().toUpperCase()
    const normalizedPercent = Math.max(0, Math.min(100, Number(percent) || 0))

    set({
      cartDiscountCode: normalizedCode || null,
      cartDiscountPercent: normalizedPercent,
    })

    return { code: normalizedCode || null, percent: normalizedPercent }
  },
  clearCartDiscount: () => set({ cartDiscountCode: null, cartDiscountPercent: 0 }),
  getCartTotalBtc: () => {
    const { assets, cartAssetIds, cartDiscountPercent } = get()

    const subtotal = cartAssetIds.reduce((sum, assetId) => {
      const asset = assets.find((item) => String(item._id) === String(assetId))
      return sum + Number(asset?.btcPrice || 0)
    }, 0)

    return Number((subtotal * (1 - cartDiscountPercent / 100)).toFixed(8))
  },

  initializeCsrf: async () => {
    try {
      await apiRequest('/api/auth/csrf', { method: 'GET' })
    } catch (_error) {
      // A missing bootstrap token can still be recovered by auth flows that set cookies.
    }
  },

  fetchAssets: async () => {
    set({ assetsLoading: true, assetsError: null })

    try {
      const data = await apiRequest(ASSETS_PATH, { method: 'GET' })
      const assets = Array.isArray(data) ? data : Array.isArray(data?.assets) ? data.assets : []

      set({
        assets,
        assetsSource: data?.source || (Array.isArray(data) ? 'database' : null),
        assetsMessage: data?.message || null,
        assetsLoading: false,
      })
    } catch (error) {
      set({
        assetsSource: null,
        assetsMessage: null,
        assetsLoading: false,
        assetsError: toErrorMessage(error, 'Unable to reach /api/assets'),
      })
    }
  },

  fetchHealth: async () => {
    set({ healthLoading: true, healthError: null })

    try {
      const data = await apiRequest('/api/health', { method: 'GET' })

      set({ health: data, healthLoading: false })
    } catch (error) {
      set({
        healthLoading: false,
        healthError: toErrorMessage(error, 'Unable to reach /api/health'),
      })
    }
  },

  sendGeminiPrompt: async () => {
    const { prompt } = get()

    if (!prompt.trim()) {
      set({ geminiError: 'Prompt is required before sending.' })
      return
    }

    set({ geminiLoading: true, geminiError: null, geminiResult: null })

    try {
      const data = await apiRequest('/api/gemini', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      })

      set({ geminiResult: data?.reply || 'The dealer stays quiet. Try another signal.', geminiLoading: false })
    } catch (error) {
      set({
        geminiLoading: false,
        geminiError: toErrorMessage(error, 'Unable to reach /api/gemini'),
      })
    }
  },

  fetchMe: async () => {
    set({ authLoading: true, authError: null })

    try {
      const data = await apiRequest('/api/auth/me', { method: 'GET' })
      set({
        authUser: data?.user || null,
        authLoading: false,
        authRequiresVerification: false,
        authVerificationEmail: null,
        authVerificationToken: null,
        authResetToken: null,
      })
    } catch (_error) {
      set({
        authUser: null,
        authLoading: false,
        authRequiresVerification: false,
      })
    }
  },

  login: async ({ identifier, password }) => {
    set({ authLoading: true, authError: null })
    const normalizedIdentifier = String(identifier || '').trim()

    try {
      const payload = {
        password: String(password || ''),
      }

      if (normalizedIdentifier.includes('@')) {
        payload.email = normalizedIdentifier
      } else {
        payload.username = normalizedIdentifier
      }

      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      set({
        authUser: data?.user || null,
        authLoading: false,
        authRequiresVerification: false,
        authVerificationEmail: null,
        authVerificationToken: null,
        authResetToken: null,
      })
      return { ok: true, message: data?.message || 'Login successful.' }
    } catch (error) {
      const message = toErrorMessage(error, 'Unable to sign in right now.')
      const requiresVerification = Boolean(error?.payload?.requiresVerification || /verify your email/i.test(message))
      set(() => ({
        authLoading: false,
        authError: message,
        authRequiresVerification: requiresVerification,
        authVerificationEmail: requiresVerification && normalizedIdentifier.includes('@') ? normalizedIdentifier.toLowerCase() : null,
      }))
      return { ok: false, message, requiresVerification }
    }
  },

  register: async ({ username, email, password }) => {
    set({ authLoading: true, authError: null })

    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: String(username || '').trim(),
          email: String(email || '').trim(),
          password: String(password || ''),
          confirmPassword: String(password || ''),
        }),
      })

      set({
        authUser: data?.requiresVerification ? null : data?.user || null,
        authLoading: false,
        authRequiresVerification: Boolean(data?.requiresVerification),
        authVerificationEmail: String(email || '').trim().toLowerCase(),
        authVerificationToken: data?.verificationToken || null,
        authResetToken: null,
      })
      return {
        ok: true,
        message: data?.message || 'Registered successfully.',
        requiresVerification: Boolean(data?.requiresVerification),
      }
    } catch (error) {
      const message = toErrorMessage(error, 'Unable to register right now.')
      set({ authLoading: false, authError: message })
      return { ok: false, message }
    }
  },

  verifyEmail: async ({ token }) => {
    set({ authLoading: true, authError: null })

    try {
      const data = await apiRequest('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token: String(token || '').trim() }),
      })

      set({
        authUser: data?.user || null,
        authLoading: false,
        authRequiresVerification: false,
        authVerificationEmail: null,
        authVerificationToken: null,
        authResetToken: null,
      })

      return { ok: true, message: data?.message || 'Email verified successfully.' }
    } catch (error) {
      const message = toErrorMessage(error, 'Unable to verify email right now.')
      set({ authLoading: false, authError: message })
      return { ok: false, message }
    }
  },

  requestVerification: async ({ email }) => {
    set({ authLoading: true, authError: null })

    try {
      const normalizedEmail = String(email || '').trim().toLowerCase()
      const data = await apiRequest('/api/auth/request-verification', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail }),
      })

      set({
        authLoading: false,
        authVerificationEmail: normalizedEmail,
        authVerificationToken: data?.verificationToken || null,
      })

      return { ok: true, message: data?.message || 'Verification email prepared.' }
    } catch (error) {
      const message = toErrorMessage(error, 'Unable to request verification right now.')
      set({ authLoading: false, authError: message })
      return { ok: false, message }
    }
  },

  requestPasswordReset: async ({ email }) => {
    set({ authLoading: true, authError: null })

    try {
      const data = await apiRequest('/api/auth/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email: String(email || '').trim().toLowerCase() }),
      })

      set({
        authLoading: false,
        authResetToken: data?.resetToken || null,
      })

      return { ok: true, message: data?.message || 'Password reset link prepared.' }
    } catch (error) {
      const message = toErrorMessage(error, 'Unable to request password reset right now.')
      set({ authLoading: false, authError: message })
      return { ok: false, message }
    }
  },

  resetPassword: async ({ token, password }) => {
    set({ authLoading: true, authError: null })

    try {
      const data = await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: String(token || '').trim(),
          password: String(password || ''),
          confirmPassword: String(password || ''),
        }),
      })

      set({
        authUser: data?.user || null,
        authLoading: false,
        authRequiresVerification: false,
        authVerificationEmail: null,
        authVerificationToken: null,
        authResetToken: null,
      })

      return { ok: true, message: data?.message || 'Password reset successful.' }
    } catch (error) {
      const message = toErrorMessage(error, 'Unable to reset password right now.')
      set({ authLoading: false, authError: message })
      return { ok: false, message }
    }
  },

  logout: async () => {
    set({ authLoading: true, authError: null })

    try {
      await apiRequest('/api/auth/logout', { method: 'POST', requireCsrf: true })
      set({
        authUser: null,
        authLoading: false,
        authRequiresVerification: false,
        authVerificationEmail: null,
        authVerificationToken: null,
        authResetToken: null,
      })
      return { ok: true }
    } catch (error) {
      const message = toErrorMessage(error, 'Unable to log out right now.')
      set({ authLoading: false, authError: message })
      return { ok: false, message }
    }
  },

  checkout: async ({ assetIds, discountCode, paymentRail, alias, wallet }) => {
    set({ checkoutLoading: true, checkoutError: null, checkoutResult: null })

    try {
      const resolvedAssetIds = Array.isArray(assetIds) ? assetIds : get().cartAssetIds
      const data = await apiRequest('/api/checkout', {
        method: 'POST',
        requireCsrf: true,
        body: JSON.stringify({
          assetIds: resolvedAssetIds,
          discountCode,
          paymentRail,
          alias,
          wallet,
        }),
      })

      const purchasedAssetIds = Array.isArray(data?.purchasedAssets)
        ? data.purchasedAssets.map((asset) => asset?.id).filter(Boolean)
        : []

      set((state) => ({
        checkoutLoading: false,
        checkoutResult: data,
        authUser: state.authUser
          ? {
              ...state.authUser,
              ownedAssets: Array.from(
                new Set([...(state.authUser.ownedAssets || state.authUser.purchasedAssets || []), ...purchasedAssetIds]),
              ),
              purchasedAssets: Array.from(
                new Set([...(state.authUser.ownedAssets || state.authUser.purchasedAssets || []), ...purchasedAssetIds]),
              ),
            }
          : state.authUser,
      }))

      return { ok: true, data }
    } catch (error) {
      const message = toErrorMessage(error, 'Unable to complete checkout right now.')
      set({
        checkoutLoading: false,
        checkoutError: message,
      })
      return { ok: false, message }
    }
  },

  downloadAsset: async (assetId) => {
    set({ downloadLoadingAssetId: assetId, authError: null })

    try {
      const data = await apiRequest(`/api/download/${assetId}`, { method: 'GET' })

      set({ downloadLoadingAssetId: null })
      return { ok: true, data }
    } catch (error) {
      const message = toErrorMessage(error, 'Unable to open download right now.')
      set({ downloadLoadingAssetId: null, authError: message })
      return { ok: false, message }
    }
  },
}))
