import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Cpu,
  Download,
  HardDrive,
  LogIn,
  LogOut,
  Search,
  Shield,
  ShoppingCart,
  TerminalSquare,
  Trash2,
  UserRound,
  X,
  Wallet,
} from 'lucide-react'
import { useMarketStore } from './store/useMarketStore'
import { EmptyState } from './components/empty-state'
import { GlitchButton } from './components/glitch-button'
import { NoticeBanner } from './components/notice-banner'
import { StatusPill } from './components/status-pill'
import { TypewriterText } from './components/typewriter-text'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './components/ui/select'
import { Separator } from './components/ui/separator'
import { Textarea } from './components/ui/textarea'

const NAV_BUCKETS = [
  { key: 'all', label: 'All Catalog', categories: null },
  { key: 'scripts', label: 'Scripts', categories: ['scripts', 'automation'] },
  { key: 'operations', label: 'Operations', categories: ['ops', 'finance', 'support'] },
  { key: 'interfaces', label: 'Interfaces', categories: ['ui', 'monitoring'] },
]

const MotionSection = motion.section
const MotionDiv = motion.div

const initialCheckoutData = {
  alias: '',
  wallet: '',
  promo: '',
  paymentRail: 'xmr',
}

function App() {
  const [activeView, setActiveView] = useState('storefront')
  const [activeBucket, setActiveBucket] = useState('all')
  const [searchValue, setSearchValue] = useState('')
  const [focusedAsset, setFocusedAsset] = useState(null)
  const [cartAssetIds, setCartAssetIds] = useState([])
  const [checkoutData, setCheckoutData] = useState(initialCheckoutData)
  const [checkoutErrors, setCheckoutErrors] = useState({})
  const [authMode, setAuthMode] = useState('login')
  const [authData, setAuthData] = useState({
    identifier: '',
    username: '',
    email: '',
    password: '',
  })
  const [verificationTokenInput, setVerificationTokenInput] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetTokenInput, setResetTokenInput] = useState('')
  const [resetPasswordInput, setResetPasswordInput] = useState('')
  const [authFieldErrors, setAuthFieldErrors] = useState({})
  const [lastVerificationResendAt, setLastVerificationResendAt] = useState(null)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [uiNotice, setUiNotice] = useState(null)
  const [recentSettlements, setRecentSettlements] = useState([])

  const assets = useMarketStore((state) => state.assets)
  const assetsSource = useMarketStore((state) => state.assetsSource)
  const assetsMessage = useMarketStore((state) => state.assetsMessage)
  const assetsLoading = useMarketStore((state) => state.assetsLoading)
  const assetsError = useMarketStore((state) => state.assetsError)
  const fetchAssets = useMarketStore((state) => state.fetchAssets)
  const health = useMarketStore((state) => state.health)
  const healthLoading = useMarketStore((state) => state.healthLoading)
  const healthError = useMarketStore((state) => state.healthError)
  const fetchHealth = useMarketStore((state) => state.fetchHealth)
  const prompt = useMarketStore((state) => state.prompt)
  const setPrompt = useMarketStore((state) => state.setPrompt)
  const geminiResult = useMarketStore((state) => state.geminiResult)
  const geminiLoading = useMarketStore((state) => state.geminiLoading)
  const geminiError = useMarketStore((state) => state.geminiError)
  const sendGeminiPrompt = useMarketStore((state) => state.sendGeminiPrompt)
  const authUser = useMarketStore((state) => state.authUser)
  const authLoading = useMarketStore((state) => state.authLoading)
  const authError = useMarketStore((state) => state.authError)
  const authRequiresVerification = useMarketStore((state) => state.authRequiresVerification)
  const authVerificationEmail = useMarketStore((state) => state.authVerificationEmail)
  const authVerificationToken = useMarketStore((state) => state.authVerificationToken)
  const authResetToken = useMarketStore((state) => state.authResetToken)
  const initializeCsrf = useMarketStore((state) => state.initializeCsrf)
  const fetchMe = useMarketStore((state) => state.fetchMe)
  const login = useMarketStore((state) => state.login)
  const register = useMarketStore((state) => state.register)
  const verifyEmail = useMarketStore((state) => state.verifyEmail)
  const requestVerification = useMarketStore((state) => state.requestVerification)
  const requestPasswordReset = useMarketStore((state) => state.requestPasswordReset)
  const resetPassword = useMarketStore((state) => state.resetPassword)
  const logout = useMarketStore((state) => state.logout)
  const clearAuthError = useMarketStore((state) => state.clearAuthError)
  const checkout = useMarketStore((state) => state.checkout)
  const checkoutLoading = useMarketStore((state) => state.checkoutLoading)
  const checkoutError = useMarketStore((state) => state.checkoutError)
  const checkoutResult = useMarketStore((state) => state.checkoutResult)
  const clearCheckoutResult = useMarketStore((state) => state.clearCheckoutResult)
  const downloadAsset = useMarketStore((state) => state.downloadAsset)
  const downloadLoadingAssetId = useMarketStore((state) => state.downloadLoadingAssetId)

  const availableCategories = useMemo(() => {
    return Array.from(new Set(assets.map((asset) => asset.category))).sort()
  }, [assets])

  const filteredAssets = useMemo(() => {
    const selectedBucket = NAV_BUCKETS.find((item) => item.key === activeBucket)
    return assets.filter((asset) => {
      const bucketMatch =
        !selectedBucket?.categories || selectedBucket.categories.includes(asset.category)
      const searchMatch = `${asset.name} ${asset.description}`
        .toLowerCase()
        .includes(searchValue.trim().toLowerCase())

      return bucketMatch && searchMatch
    })
  }, [activeBucket, assets, searchValue])

  const cartItems = useMemo(() => {
    return cartAssetIds
      .map((assetId) => {
        const asset = assets.find((item) => item._id === assetId)
        return asset || null
      })
      .filter(Boolean)
  }, [assets, cartAssetIds])

  const ownedAssetIds = useMemo(() => {
    return new Set((authUser?.purchasedAssets || []).map((assetId) => String(assetId)))
  }, [authUser])

  const cartTotalBtc = useMemo(() => {
    return cartItems.reduce((sum, asset) => {
      return sum + Number(asset.btcPrice)
    }, 0)
  }, [cartItems])

  const authStateLabel = authUser
    ? 'Authenticated'
    : authRequiresVerification
      ? 'Verification Pending'
      : 'Guest Session'
  const assetCountLabel = `${assets.length} assets`
  const cartCountLabel = `${cartAssetIds.length} queued`
  const ownedCountLabel = `${authUser?.purchasedAssets?.length || 0} owned`
  const categoryCountLabel = `${availableCategories.length} categories`
  const resendCooldownSeconds = lastVerificationResendAt
    ? Math.max(0, 60 - Math.floor((nowMs - lastVerificationResendAt) / 1000))
    : 0
  const canResendVerification = resendCooldownSeconds === 0

  const handleGeminiSubmit = async (event) => {
    event.preventDefault()
    await sendGeminiPrompt()
  }

  const handleAddToCart = (assetId) => {
    setCartAssetIds((current) => {
      if (current.includes(assetId)) {
        setUiNotice({ tone: 'warning', message: 'Asset already queued in checkout.' })
        return current
      }

      setUiNotice({ tone: 'success', message: 'Asset queued for settlement.' })
      return [...current, assetId]
    })
  }

  const handleRemoveFromCart = (assetId) => {
    setCartAssetIds((current) => current.filter((id) => id !== assetId))
  }

  const handleDownloadAsset = async (assetId) => {
    const downloadWindow = window.open('', '_blank', 'noopener,noreferrer')
    const result = await downloadAsset(assetId)

    if (result.ok && result.data?.downloadUrl) {
      if (downloadWindow) {
        downloadWindow.location.href = result.data.downloadUrl
      } else {
        window.location.assign(result.data.downloadUrl)
      }
      return
    }

    if (downloadWindow) {
      downloadWindow.close()
    }
  }

  const handleClearCart = () => {
    setCartAssetIds([])
    clearCheckoutResult()
  }

  const validateCheckout = () => {
    const errors = {}

    if (!checkoutData.alias.trim()) {
      errors.alias = 'Alias is required.'
    }

    if (!checkoutData.wallet.trim()) {
      errors.wallet = 'Wallet address is required.'
    } else if (checkoutData.wallet.trim().length < 8) {
      errors.wallet = 'Wallet address looks too short.'
    }

    if (!checkoutData.paymentRail) {
      errors.paymentRail = 'Choose a payment rail.'
    }

    if (cartAssetIds.length === 0) {
      errors.cart = 'Add at least one asset before checkout.'
    }

    if (!authUser) {
      errors.auth = 'Authentication is required before checkout.'
    } else if (!authUser.isVerified) {
      errors.auth = 'Verify your email before checkout.'
    }

    return errors
  }

  const validateAuthForm = () => {
    const errors = {}

    if (authMode === 'login') {
      if (!String(authData.identifier || '').trim()) {
        errors.identifier = 'Email or username is required.'
      }
    }

    if (authMode === 'register') {
      if (!String(authData.username || '').trim()) {
        errors.username = 'Username is required.'
      }
      if (!String(authData.email || '').trim()) {
        errors.email = 'Email is required.'
      } else if (!/^\S+@\S+\.\S+$/.test(String(authData.email || '').trim())) {
        errors.email = 'Email format is invalid.'
      }
    }

    if (authMode === 'login' || authMode === 'register') {
      if (!String(authData.password || '')) {
        errors.password = 'Password is required.'
      }
    }

    return errors
  }

  const handleCheckoutSubmit = async (event) => {
    event.preventDefault()
    clearCheckoutResult()

    const errors = validateCheckout()
    setCheckoutErrors(errors)

    if (Object.keys(errors).length > 0) {
      if (errors.auth) {
        setUiNotice({ tone: 'danger', message: errors.auth })
      }
      return
    }

    const result = await checkout({
      assetIds: cartAssetIds,
      discountCode: checkoutData.promo.trim(),
      paymentRail: checkoutData.paymentRail,
      alias: checkoutData.alias.trim(),
      wallet: checkoutData.wallet.trim(),
    })

    if (result.ok) {
      setUiNotice({ tone: 'success', message: 'Settlement complete. Receipt generated.' })
      setRecentSettlements((current) => {
        const order = result.data?.order

        if (!order) {
          return current
        }

        const next = [
          {
            id: order.id,
            totalBtc: Number(order.totalBtc),
            discountPercent: Number(order.discountPercent || 0),
            status: order.status,
          },
          ...current,
        ]

        return next.slice(0, 5)
      })
      setCartAssetIds([])
      setCheckoutData((current) => ({
        ...initialCheckoutData,
        paymentRail: current.paymentRail,
      }))
      setCheckoutErrors({})
    }
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    clearAuthError()
    const errors = validateAuthForm()
    setAuthFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    if (authMode === 'login') {
      const result = await login({
        identifier: authData.identifier,
        password: authData.password,
      })

      if (result.ok) {
        setUiNotice({ tone: 'success', message: 'Session authenticated.' })
        setAuthData((current) => ({ ...current, password: '' }))
      } else if (result.requiresVerification) {
        setAuthMode('verify')
        setUiNotice({ tone: 'warning', message: 'Email verification required before sign in.' })
      }

      return
    }

    const result = await register({
      username: authData.username,
      email: authData.email,
      password: authData.password,
    })

    if (result.ok) {
      if (result.requiresVerification) {
        setUiNotice({ tone: 'info', message: 'Account created. Enter verification token to continue.' })
        setAuthMode('verify')
      } else {
        setUiNotice({ tone: 'success', message: 'Operator profile created and authenticated.' })
      }

      setAuthData((current) => ({
        ...current,
        password: '',
      }))
    }
  }

  const handleVerifyEmail = async (event) => {
    event.preventDefault()
    clearAuthError()

    const result = await verifyEmail({ token: verificationTokenInput })

    if (result.ok) {
      setUiNotice({ tone: 'success', message: result.message || 'Email verified. Session authorized.' })
      setVerificationTokenInput('')
      setAuthMode('login')
    }
  }

  const handleRequestVerification = async () => {
    if (!canResendVerification) {
      return
    }

    clearAuthError()
    const email = authVerificationEmail || authData.email || authData.identifier
    const result = await requestVerification({ email })

    if (result.ok) {
      setUiNotice({ tone: 'info', message: result.message || 'Verification token prepared.' })
      setLastVerificationResendAt(Date.now())
    }
  }

  const handleRequestReset = async (event) => {
    event.preventDefault()
    clearAuthError()

    const result = await requestPasswordReset({ email: resetEmail })

    if (result.ok) {
      setUiNotice({ tone: 'info', message: result.message || 'Password reset token prepared.' })
      setAuthMode('reset')
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    clearAuthError()

    const result = await resetPassword({
      token: resetTokenInput,
      password: resetPasswordInput,
    })

    if (result.ok) {
      setUiNotice({ tone: 'success', message: result.message || 'Password updated and session restored.' })
      setResetTokenInput('')
      setResetPasswordInput('')
      setAuthMode('login')
    }
  }

  const handleLogout = async () => {
    const result = await logout()

    if (result.ok) {
      setUiNotice({ tone: 'info', message: 'Session terminated.' })
      setCheckoutErrors((current) => ({
        ...current,
        auth: 'Authentication is required before checkout.',
      }))
      setAuthFieldErrors({})
    }
  }

  const healthState = healthError ? 'Offline' : health ? 'Online' : 'Unknown'
  const healthTone = healthError ? 'danger' : health ? 'success' : 'neutral'

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    initializeCsrf()
    fetchAssets()
    fetchHealth()
    fetchMe()
  }, [initializeCsrf, fetchAssets, fetchHealth, fetchMe])

  useEffect(() => {
    if (authRequiresVerification) {
      setAuthMode('verify')
    }
  }, [authRequiresVerification])

  useEffect(() => {
    setAuthFieldErrors({})
    clearAuthError()
  }, [authMode, clearAuthError])

  useEffect(() => {
    if (authVerificationToken) {
      setVerificationTokenInput(authVerificationToken)
    }
  }, [authVerificationToken])

  useEffect(() => {
    if (authResetToken) {
      setResetTokenInput(authResetToken)
    }
  }, [authResetToken])

  const sourceLabel = assetsSource ? assetsSource.replace('-', ' ') : 'unknown'

  return (
    <div className="retro-panel content-shell relative min-h-dvh bg-black text-[#c8ffd9]">
      <div className="crt-overlay" aria-hidden="true" />

      <div className="terminal-grid grid min-h-dvh grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="terminal-panel border-b border-[#1f4f2f]/70 bg-gradient-to-b from-black/92 to-[#020a05]/80 p-4.5 lg:h-dvh lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-6">
          <div className="mb-5 rounded-xl border border-[#1f4f2f]/50 bg-black/35 p-4 shadow-[0_0_24px_rgba(0,255,65,0.06)]">
            <p className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#66c689]">
              <TerminalSquare size={14} />
              root@0xmarket:~$
              <span className="cursor-block" aria-hidden="true" />
            </p>
            <h1 className="font-retro retro-headline text-5xl leading-tight">0x Market</h1>
            <p className="retro-muted terminal-kicker mt-1">Secure asset exchange</p>
          </div>

          <div className="space-y-1.5 rounded-xl border border-[#1f4f2f]/50 bg-black/25 p-2.5">
            {NAV_BUCKETS.map((bucket) => (
              <Button
                key={bucket.key}
                variant={activeBucket === bucket.key ? 'default' : 'ghost'}
                className="w-full justify-start rounded-md"
                onClick={() => {
                  setActiveView('storefront')
                  setActiveBucket(bucket.key)
                }}
              >
                {bucket.label}
              </Button>
            ))}
          </div>

          <Separator className="my-3.5" />

          <Card variant="panel" className="mb-3.5 shadow-[0_0_18px_rgba(0,255,65,0.05)]">
            <CardHeader className="pb-1.5" compact>
              <CardTitle className="flex items-center gap-1.5 text-xs">
                <UserRound size={13} />
                Operator Session
              </CardTitle>
              <CardDescription className="text-[11px] text-[#66c689]">
                Sign in to unlock downloads, or create an account to keep purchases tied to your wallet.
              </CardDescription>
            </CardHeader>
            <CardContent dense>
              {authUser ? (
                <div className="space-y-1.5 text-xs">
                  <p className="text-[#9effbf]">{authUser.username}</p>
                  <p className="text-[#66c689]">{authUser.email}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant={authMode === 'login' ? 'default' : 'ghost'}
                      className="flex-1"
                      onClick={() => setAuthMode('login')}
                    >
                      Sign In
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={authMode === 'register' ? 'default' : 'ghost'}
                      className="flex-1"
                      onClick={() => setAuthMode('register')}
                    >
                      Sign Up
                    </Button>
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant={authMode === 'verify' ? 'default' : 'ghost'}
                      className="flex-1"
                      onClick={() => setAuthMode('verify')}
                    >
                      Verify
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={authMode === 'forgot' || authMode === 'reset' ? 'default' : 'ghost'}
                      className="flex-1"
                      onClick={() => setAuthMode('forgot')}
                    >
                      Reset
                    </Button>
                  </div>

                  {(authMode === 'login' || authMode === 'register') && (
                    <form onSubmit={handleAuthSubmit} className="space-y-2">
                      {authMode === 'login' ? (
                        <div className="space-y-1">
                          <Input
                            value={authData.identifier}
                            onChange={(event) =>
                              setAuthData((current) => ({ ...current, identifier: event.target.value }))
                            }
                            placeholder="email or username"
                            aria-invalid={Boolean(authFieldErrors.identifier)}
                          />
                          {authFieldErrors.identifier && <p className="text-xs text-red-400">{authFieldErrors.identifier}</p>}
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <Input
                              value={authData.username}
                              onChange={(event) =>
                                setAuthData((current) => ({ ...current, username: event.target.value }))
                              }
                              placeholder="operator handle"
                              aria-invalid={Boolean(authFieldErrors.username)}
                            />
                            <p className="text-[11px] text-[#66c689]">3-32 chars: letters, numbers, dots, underscores, hyphens.</p>
                            {authFieldErrors.username && <p className="text-xs text-red-400">{authFieldErrors.username}</p>}
                          </div>
                          <div className="space-y-1">
                            <Input
                              type="email"
                              value={authData.email}
                              onChange={(event) =>
                                setAuthData((current) => ({ ...current, email: event.target.value }))
                              }
                              placeholder="operator@domain.tld"
                              aria-invalid={Boolean(authFieldErrors.email)}
                            />
                            <p className="text-[11px] text-[#66c689]">Use a valid email format, for example name@domain.tld.</p>
                            {authFieldErrors.email && <p className="text-xs text-red-400">{authFieldErrors.email}</p>}
                          </div>
                        </>
                      )}

                      <div className="space-y-1">
                        <Input
                          type="password"
                          value={authData.password}
                          onChange={(event) =>
                            setAuthData((current) => ({ ...current, password: event.target.value }))
                          }
                          placeholder="••••••••"
                          aria-invalid={Boolean(authFieldErrors.password)}
                        />
                        <p className="text-[11px] text-[#66c689]">12+ chars, letters, numbers, and one symbol.</p>
                        {authFieldErrors.password && <p className="text-xs text-red-400">{authFieldErrors.password}</p>}
                      </div>

                      <div className="flex gap-1.5">
                        <GlitchButton type="submit" size="sm" className="w-full" disabled={authLoading}>
                          <LogIn className="mr-1 h-3.5 w-3.5" />
                          {authLoading ? 'Syncing...' : authMode === 'login' ? 'Authorize Session' : 'Create Account'}
                        </GlitchButton>
                        {authMode === 'login' && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="w-full"
                            onClick={() => {
                              setResetEmail(authData.identifier)
                              setAuthMode('forgot')
                            }}
                          >
                            Forgot
                          </Button>
                        )}
                      </div>
                    </form>
                  )}

                  {authMode === 'verify' && (
                    <form onSubmit={handleVerifyEmail} className="space-y-2">
                      <Input
                        value={verificationTokenInput}
                        onChange={(event) => setVerificationTokenInput(event.target.value)}
                        placeholder="verification token"
                      />
                      <div className="flex gap-1.5">
                        <GlitchButton type="submit" size="sm" className="w-full" disabled={authLoading}>
                          {authLoading ? 'Verifying...' : 'Verify Email'}
                        </GlitchButton>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="w-full"
                          onClick={handleRequestVerification}
                          disabled={authLoading || !canResendVerification}
                        >
                          {canResendVerification ? 'Resend' : `Resend in ${resendCooldownSeconds}s`}
                        </Button>
                      </div>
                      <p className="text-[11px] text-[#66c689]">
                        {authVerificationEmail ? `Target: ${authVerificationEmail}` : 'Provide your verification token.'}
                      </p>
                    </form>
                  )}

                  {authMode === 'forgot' && (
                    <form onSubmit={handleRequestReset} className="space-y-2">
                      <Input
                        type="email"
                        value={resetEmail}
                        onChange={(event) => setResetEmail(event.target.value)}
                        placeholder="account email"
                      />
                      <div className="flex gap-1.5">
                        <GlitchButton type="submit" size="sm" className="w-full" disabled={authLoading}>
                          {authLoading ? 'Sending...' : 'Request Reset'}
                        </GlitchButton>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="w-full"
                          onClick={() => setAuthMode('reset')}
                        >
                          Use Token
                        </Button>
                      </div>
                    </form>
                  )}

                  {authMode === 'reset' && (
                    <form onSubmit={handleResetPassword} className="space-y-2">
                      <Input
                        value={resetTokenInput}
                        onChange={(event) => setResetTokenInput(event.target.value)}
                        placeholder="reset token"
                      />
                      <Input
                        type="password"
                        value={resetPasswordInput}
                        onChange={(event) => setResetPasswordInput(event.target.value)}
                        placeholder="new strong password"
                      />
                      <GlitchButton type="submit" size="sm" className="w-full" disabled={authLoading}>
                        {authLoading ? 'Resetting...' : 'Reset Password'}
                      </GlitchButton>
                    </form>
                  )}

                  {authError && <p className="text-xs text-red-400">{authError}</p>}
                </div>
              )}
            </CardContent>
            {authUser && (
              <CardFooter dense>
                <Button size="sm" variant="ghost" className="w-full" onClick={handleLogout} disabled={authLoading}>
                  <LogOut className="mr-1 h-3.5 w-3.5" />
                  Logout
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card variant="panel" className="mb-3.5 shadow-[0_0_18px_rgba(0,255,65,0.05)]">
            <CardHeader className="pb-1.5">
              <CardTitle className="flex items-center gap-1.5 text-xs">
                <ShoppingCart size={13} />
                Cart Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#66c689]">Queued</span>
                <span className="text-[#9effbf]">{cartAssetIds.length} item(s)</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="text-[#66c689]">Total</span>
                <span className="phosphor-glow">{cartTotalBtc.toFixed(2)} BTC</span>
              </div>
              {cartItems.length > 0 && (
                <div className="mt-2 space-y-1.5 border-t border-[#1f4f2f] pt-2.5">
                  {cartItems.slice(0, 4).map((asset) => (
                    <div key={asset._id} className="flex items-center justify-between gap-1.5">
                      <span className="line-clamp-1 text-xs text-[#9effbf]">{asset.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-[#66c689] hover:text-red-300"
                        onClick={() => handleRemoveFromCart(asset._id)}
                        aria-label={`Remove ${asset.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-1.5">
              <GlitchButton size="sm" className="w-full" onClick={() => setActiveView('checkout')}>
                Open Checkout
              </GlitchButton>
              <Button size="sm" variant="ghost" className="w-full" onClick={handleClearCart} disabled={cartAssetIds.length === 0}>
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Clear Cart
              </Button>
            </CardFooter>
          </Card>

          <Card variant="panel">
            <CardHeader className="pb-1.5">
              <CardTitle className="flex items-center gap-1.5 text-xs">
                <Activity size={13} />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatusPill label={healthState} tone={healthTone} />
              {healthError && <p className="mt-1.5 text-xs text-red-400">{healthError}</p>}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full" onClick={fetchHealth} disabled={healthLoading}>
                {healthLoading ? 'Pinging...' : 'Refresh Probe'}
              </Button>
            </CardFooter>
          </Card>
        </aside>

        <main className="relative min-w-0 flex min-h-0 flex-col overflow-hidden bg-gradient-to-b from-black/45 via-black/30 to-[#020a05]/45">
          <div className="terminal-panel sticky top-0 z-20 border-b border-[#1f4f2f]/70 bg-black/72 backdrop-blur-md">
            <div className="space-y-4 px-4 py-4 md:px-6 md:py-5">
              <NoticeBanner notice={uiNotice} onDismiss={() => setUiNotice(null)} />

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)] xl:items-end">
                <div className="space-y-2">
                  <p className="terminal-kicker flex items-center gap-2 text-[#66c689]/80">
                    <TerminalSquare size={13} />
                    secure catalog / live session
                  </p>
                  <div className="flex flex-wrap items-end gap-3">
                    <h2 className="terminal-heading font-retro text-4xl leading-none text-[#d8ffe6] sm:text-5xl">Marketplace Control</h2>
                    <Badge variant={authUser ? 'success' : authRequiresVerification ? 'warning' : 'info'} className="mb-1">
                      {authStateLabel}
                    </Badge>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-[#8bd3a0]">
                    Browse curated assets, verify your account, and move through checkout with session-bound access control.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: 'Catalog', value: assetCountLabel },
                    { label: 'Queue', value: cartCountLabel },
                    { label: 'Owned', value: ownedCountLabel },
                    { label: 'Groups', value: categoryCountLabel },
                  ].map((item) => (
                    <Card key={item.label} variant="panel" className="border-[#1f4f2f]/50 bg-black/30">
                      <CardContent dense className="space-y-1 p-2.5">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[#66c689]/70">{item.label}</p>
                        <p className="text-sm font-semibold text-[#d7ffe6]">{item.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-[#1f4f2f]/60 bg-black/30 p-3 shadow-[0_0_20px_rgba(0,255,65,0.05)] md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    variant={activeView === 'storefront' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('storefront')}
                  >
                    Storefront
                  </Button>
                  <Button
                    variant={activeView === 'checkout' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('checkout')}
                  >
                    Checkout
                  </Button>
                  <Badge variant={authUser ? 'success' : 'warning'}>{authUser ? 'Authenticated' : 'Guest Session'}</Badge>
                  <StatusPill label={healthState} tone={healthTone} />
                </div>

                <div className="flex w-full items-center gap-2 rounded-lg border border-[#1f4f2f]/60 bg-black/40 px-3 py-2 md:w-auto md:min-w-[320px]">
                  <Search className="h-4 w-4 flex-shrink-0 text-[#66c689]/80" />
                  <Input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search catalog, category, or description"
                    className="h-8 border-0 bg-transparent px-0 text-sm placeholder:text-[#66c689]/40 focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
            <AnimatePresence mode="wait">
              {activeView === 'storefront' ? (
                <MotionSection
                  key="storefront"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.14em] text-[#66c689]">
                    <span>Inventory Stream</span>
                    <span>{filteredAssets.length} record(s)</span>
                  </div>

                  <div className="mb-3.5 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#66c689]">
                    <Badge variant="outline">Source: {sourceLabel}</Badge>
                    {assetsMessage && <Badge variant="outline">{assetsMessage}</Badge>}
                  </div>

                  {assetsLoading && <p className="text-xs text-[#66c689]">Loading assets from the data vault...</p>}
                  {assetsLoading && (
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {[...Array(8)].map((_, index) => (
                        <Card key={`skeleton-${index}`} className="h-40 animate-pulse" variant="panel" />
                      ))}
                    </div>
                  )}
                  {assetsError && (
                    <Card variant="danger">
                      <CardContent className="pt-3 text-xs text-red-300">
                        Asset error: {assetsError}
                        <Button className="ml-2" size="sm" variant="warning" onClick={fetchAssets}>
                          Retry Feed
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {!assetsLoading && !assetsError && filteredAssets.length === 0 && (
                    <EmptyState
                      title="No assets found"
                      description="Try switching bucket or clearing your search query."
                    />
                  )}

                  {!assetsLoading && !assetsError && filteredAssets.length > 0 && (
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {filteredAssets.map((asset, index) => (
                        <MotionDiv
                          key={asset._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.18 }}
                        >
                          <Card className="flex h-full flex-col transition hover:border-[#00ff41]/60 hover:bg-black/80">
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center justify-between">
                                <span className="mr-2 line-clamp-1 text-xs sm:text-sm">{asset.name}</span>
                                <Shield size={14} className="text-[#66c689]" />
                              </CardTitle>
                              <CardDescription className="line-clamp-2 text-xs sm:text-sm">{asset.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge>{asset.category}</Badge>
                                {asset.isEncrypted && <Badge variant="outline">Encrypted</Badge>}
                              </div>
                            </CardContent>
                            <CardFooter className="justify-between gap-2">
                              <span className="phosphor-glow text-sm font-semibold drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]">
                                {Number(asset.btcPrice).toFixed(2)} BTC
                              </span>
                              <div className="flex gap-1 sm:gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setFocusedAsset(asset)}>
                                  Inspect
                                </Button>
                                <GlitchButton size="sm" onClick={() => handleAddToCart(asset._id)}>
                                  Inject
                                </GlitchButton>
                                {ownedAssetIds.has(String(asset._id)) && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleDownloadAsset(asset._id)}
                                    disabled={downloadLoadingAssetId === asset._id}
                                  >
                                    <Download className="mr-1 h-3.5 w-3.5" />
                                    {downloadLoadingAssetId === asset._id ? 'Opening...' : 'Download'}
                                  </Button>
                                )}
                              </div>
                            </CardFooter>
                          </Card>
                        </MotionDiv>
                      ))}
                    </div>
                  )}
                </MotionSection>
              ) : (
                <MotionSection
                  key="checkout"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr] 2xl:grid-cols-[1.1fr_0.9fr]"
                >
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle className="phosphor-glow drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]">
                        Payload Manifest
                      </CardTitle>
                      <CardDescription>Queued assets before chain settlement.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {cartItems.length === 0 && (
                        <p className="text-xs text-[#66c689]">No payload in cart yet. Add assets from the storefront.</p>
                      )}
                      {cartItems.map((asset) => (
                        <div
                          key={asset._id}
                          className="flex items-center justify-between gap-2 border border-[#1f4f2f] bg-black/40 px-2.5 py-2 text-xs"
                        >
                          <div>
                            <p className="line-clamp-1 leading-tight">{asset.name}</p>
                            <p className="text-xs uppercase tracking-[0.12em] text-[#66c689]">{asset.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#9effbf]">{Number(asset.btcPrice).toFixed(2)} BTC</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-[#66c689] hover:text-red-300"
                              onClick={() => handleRemoveFromCart(asset._id)}
                              aria-label={`Remove ${asset.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {checkoutErrors.cart && <p className="text-xs text-red-400">{checkoutErrors.cart}</p>}
                    </CardContent>
                    <CardFooter className="justify-between border-t border-[#1f4f2f] pt-2.5">
                      <span className="text-xs uppercase tracking-[0.12em] text-[#66c689]">Total</span>
                      <span className="phosphor-glow text-sm font-semibold drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]">
                        {cartTotalBtc.toFixed(2)} BTC
                      </span>
                    </CardFooter>
                  </Card>

                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet size={14} />
                        Checkout Cipher
                      </CardTitle>
                      <CardDescription>Authenticate and dispatch your selected payload set.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {!authUser && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Sign in before checkout.
                        </div>
                      )}
                      {authUser && !authUser.isVerified && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Verify your email before checkout.
                        </div>
                      )}
                      {checkoutErrors.auth && (
                        <div className="flex items-center gap-1.5 text-xs text-red-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {checkoutErrors.auth}
                        </div>
                      )}

                      <form className="space-y-2.5" onSubmit={handleCheckoutSubmit}>
                        <div className="space-y-1">
                          <Label htmlFor="alias" className="text-xs">Alias</Label>
                          <Input
                            id="alias"
                            aria-invalid={Boolean(checkoutErrors.alias)}
                            value={checkoutData.alias}
                            onChange={(event) =>
                              setCheckoutData((current) => ({ ...current, alias: event.target.value }))
                            }
                            placeholder="ghost-runner"
                            className="text-xs"
                          />
                          {checkoutErrors.alias && <p className="text-xs text-red-400">{checkoutErrors.alias}</p>}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="wallet" className="text-xs">Wallet Address</Label>
                          <Input
                            id="wallet"
                            aria-invalid={Boolean(checkoutErrors.wallet)}
                            value={checkoutData.wallet}
                            onChange={(event) =>
                              setCheckoutData((current) => ({ ...current, wallet: event.target.value }))
                            }
                            placeholder="bc1q..."
                            className="text-xs"
                          />
                          {checkoutErrors.wallet && <p className="text-xs text-red-400">{checkoutErrors.wallet}</p>}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="rail" className="text-xs">Payment Rail</Label>
                          <Select
                            value={checkoutData.paymentRail}
                            onValueChange={(value) =>
                              setCheckoutData((current) => ({ ...current, paymentRail: value }))
                            }
                          >
                            <SelectTrigger id="rail" aria-invalid={Boolean(checkoutErrors.paymentRail)}>
                              <SelectValue placeholder="Select rail" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Cryptocurrency</SelectLabel>
                                <SelectItem value="xmr">Monero</SelectItem>
                                <SelectItem value="btc">Bitcoin</SelectItem>
                                <SelectItem value="sol">Solana</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {checkoutErrors.paymentRail && <p className="text-xs text-red-400">{checkoutErrors.paymentRail}</p>}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="promo" className="text-xs">Discount Key</Label>
                          <Input
                            id="promo"
                            value={checkoutData.promo}
                            onChange={(event) =>
                              setCheckoutData((current) => ({ ...current, promo: event.target.value }))
                            }
                            placeholder="NULLBYTE"
                            className="text-xs"
                          />
                        </div>

                        {checkoutError && <p className="text-xs text-red-400">{checkoutError}</p>}

                        <CardFooter className="px-0 pb-0 pt-1.5">
                          <GlitchButton className="w-full" type="submit" disabled={checkoutLoading || !authUser || !authUser.isVerified}>
                            {checkoutLoading ? 'Executing...' : 'Execute Settlement'}
                          </GlitchButton>
                        </CardFooter>
                      </form>

                      {checkoutResult?.order && (
                        <Card variant="success">
                          <CardHeader compact className="pb-2">
                            <CardTitle className="flex items-center gap-1.5 text-xs text-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Settlement Confirmed
                            </CardTitle>
                            <CardDescription className="text-emerald-300/90">
                              Order #{checkoutResult.order.id}
                            </CardDescription>
                          </CardHeader>
                          <CardContent dense className="space-y-1 text-xs">
                            <p className="text-emerald-200">Status: {checkoutResult.order.status}</p>
                            <p className="text-emerald-200">
                              Total Charged: {Number(checkoutResult.order.totalBtc).toFixed(2)} BTC
                            </p>
                            {checkoutResult.order.discountPercent > 0 && (
                              <p className="text-emerald-200">Discount Applied: {checkoutResult.order.discountPercent}%</p>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {recentSettlements.length > 0 && (
                        <Card variant="panel">
                          <CardHeader compact>
                            <CardTitle className="text-xs">Recent Settlements</CardTitle>
                          </CardHeader>
                          <CardContent dense className="space-y-1.5 text-xs">
                            {recentSettlements.map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between border border-[#1f4f2f] bg-black/40 px-2 py-1.5"
                              >
                                <span className="line-clamp-1 text-[#9effbf]">#{entry.id}</span>
                                <span className="text-[#66c689]">{entry.totalBtc.toFixed(2)} BTC</span>
                                <Badge size="xs" variant={entry.status === 'Completed' ? 'success' : 'warning'}>
                                  {entry.status}
                                </Badge>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                </MotionSection>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

          <section className="terminal-panel border-t border-[#1f4f2f] bg-[#020a05]/95 p-3.5 backdrop-blur-sm md:p-4">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <p className="terminal-heading font-retro retro-headline flex items-center gap-1.5 text-2xl leading-tight">
            <Bot size={14} />
            Gemini Dealer Console
          </p>
              <div className="hidden items-center gap-2 md:flex">
            <Badge variant="outline" className="text-xs">
              <Cpu className="mr-0.5 h-2.5 w-2.5" />
              {availableCategories.length} classes
            </Badge>
            <Badge variant="outline" className="text-xs">
              <HardDrive className="mr-0.5 h-2.5 w-2.5" />
              {assets.length} cached
            </Badge>
          </div>
        </div>

        <form onSubmit={handleGeminiSubmit} className="grid gap-2.5 md:grid-cols-[1fr_auto]">
          <div>
            <Label htmlFor="gemini-prompt" className="text-xs">Prompt Stream</Label>
            <Textarea
              id="gemini-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask for a build tactic, asset recommendation, or workflow mutation..."
              className="mt-0.5 text-xs"
            />
          </div>
          <div className="flex items-end">
            <GlitchButton type="submit" className="w-full md:w-auto" disabled={geminiLoading}>
              {geminiLoading ? 'Transmitting...' : 'Run AI Dealer'}
            </GlitchButton>
          </div>
        </form>

        {geminiResult && (
          <div className="terminal-panel mt-2.5 border border-[#1f4f2f] bg-black/60 p-2.5">
            <TypewriterText text={`dealer.reply > ${geminiResult}`} />
          </div>
        )}
        {geminiError && <p className="mt-1.5 text-xs text-red-400">Error: {geminiError}</p>}
          </section>

      <Dialog open={Boolean(focusedAsset)} onOpenChange={(open) => !open && setFocusedAsset(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{focusedAsset?.name}</DialogTitle>
            <DialogDescription>{focusedAsset?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 border border-[#1f4f2f] p-3 text-sm">
            <p>
              <span className="text-[#66c689]">Category:</span> {focusedAsset?.category}
            </p>
            <p>
              <span className="text-[#66c689]">Price:</span>{' '}
              {focusedAsset ? Number(focusedAsset.btcPrice).toFixed(2) : '0.00'} BTC
            </p>
            <p>
              <span className="text-[#66c689]">Encryption:</span>{' '}
              {focusedAsset?.isEncrypted ? 'Enabled' : 'Disabled'}
            </p>
            <p>
              <span className="text-[#66c689]">Access:</span>{' '}
              {focusedAsset && ownedAssetIds.has(String(focusedAsset._id)) ? 'Unlocked' : 'Locked until checkout'}
            </p>
          </div>

          <DialogFooter>
            {focusedAsset && (
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    handleAddToCart(focusedAsset._id)
                    setFocusedAsset(null)
                  }}
                >
                  Add to Cart
                </Button>
                {ownedAssetIds.has(String(focusedAsset._id)) ? (
                  <GlitchButton
                    size="sm"
                    className="flex-1"
                    onClick={async () => {
                      await handleDownloadAsset(focusedAsset._id)
                      setFocusedAsset(null)
                    }}
                    disabled={downloadLoadingAssetId === focusedAsset._id}
                  >
                    <Download className="mr-1 h-3.5 w-3.5" />
                    {downloadLoadingAssetId === focusedAsset._id ? 'Opening...' : 'Download'}
                  </GlitchButton>
                ) : null}
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App
