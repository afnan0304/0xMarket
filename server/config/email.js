const SUPPORTED_PROVIDERS = new Set(['local', 'sendgrid', 'postmark'])

const getEmailConfig = () => {
  const provider = String(process.env.EMAIL_PROVIDER || 'local').trim().toLowerCase()

  return {
    provider,
    fromAddress: String(process.env.EMAIL_FROM_ADDRESS || 'noreply@0xmarket.dev').trim(),
    appBaseUrl: String(process.env.APP_BASE_URL || process.env.CLIENT_ORIGIN?.split(',')?.[0] || 'http://localhost:5173').trim(),
    sendgridApiKey: String(process.env.SENDGRID_API_KEY || '').trim(),
    postmarkApiKey: String(process.env.POSTMARK_API_KEY || '').trim(),
    sendgridVerificationTemplateId: String(process.env.SENDGRID_VERIFICATION_TEMPLATE_ID || '').trim(),
    sendgridResetTemplateId: String(process.env.SENDGRID_RESET_TEMPLATE_ID || '').trim(),
    postmarkVerificationTemplateId: String(process.env.POSTMARK_VERIFICATION_TEMPLATE_ID || '').trim(),
    postmarkResetTemplateId: String(process.env.POSTMARK_RESET_TEMPLATE_ID || '').trim(),
  }
}

const validateEmailConfig = () => {
  const config = getEmailConfig()

  if (!SUPPORTED_PROVIDERS.has(config.provider)) {
    throw new Error(`EMAIL_PROVIDER must be one of: ${Array.from(SUPPORTED_PROVIDERS).join(', ')}`)
  }

  if (!config.fromAddress) {
    throw new Error('EMAIL_FROM_ADDRESS is required.')
  }

  if (process.env.NODE_ENV !== 'production') {
    return config
  }

  if (config.provider === 'local') {
    throw new Error('EMAIL_PROVIDER=local is not allowed in production.')
  }

  if (config.provider === 'sendgrid' && !config.sendgridApiKey) {
    throw new Error('SENDGRID_API_KEY is required when EMAIL_PROVIDER=sendgrid in production.')
  }

  if (config.provider === 'postmark' && !config.postmarkApiKey) {
    throw new Error('POSTMARK_API_KEY is required when EMAIL_PROVIDER=postmark in production.')
  }

  return config
}

module.exports = {
  SUPPORTED_PROVIDERS,
  getEmailConfig,
  validateEmailConfig,
}