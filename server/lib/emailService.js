const { getEmailConfig } = require('../config/email')

const EMAIL_API_BASE = {
  sendgrid: 'https://api.sendgrid.com/v3/mail/send',
  postmark: 'https://api.postmarkapp.com/email/withTemplate',
}

const buildExpiryLabel = (expiresAt) => {
  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt)
  return Number.isNaN(date.getTime()) ? 'soon' : date.toISOString()
}

const buildVerifyLink = ({ baseUrl, token }) => {
  const safeBase = String(baseUrl || '').replace(/\/$/, '')
  return `${safeBase}/?auth=verify&token=${encodeURIComponent(token)}`
}

const buildResetLink = ({ baseUrl, token }) => {
  const safeBase = String(baseUrl || '').replace(/\/$/, '')
  return `${safeBase}/?auth=reset&token=${encodeURIComponent(token)}`
}

const sendLocal = async ({ kind, to, token, expiresAt }) => {
  console.info(`[email:${kind}] local-delivery to=${to} expiresAt=${buildExpiryLabel(expiresAt)} token=${token}`)
  return { delivered: true, provider: 'local' }
}

const sendWithSendgrid = async ({ to, subject, html, templateId, dynamicTemplateData }) => {
  const config = getEmailConfig()

  const payload = templateId
    ? {
        from: { email: config.fromAddress },
        personalizations: [
          {
            to: [{ email: to }],
            dynamic_template_data: dynamicTemplateData,
          },
        ],
        template_id: templateId,
      }
    : {
        from: { email: config.fromAddress },
        personalizations: [{ to: [{ email: to }] }],
        subject,
        content: [{ type: 'text/html', value: html }],
      }

  const response = await fetch(EMAIL_API_BASE.sendgrid, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.sendgridApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`SendGrid email failed (${response.status}): ${body || 'Unknown error'}`)
  }

  return { delivered: true, provider: 'sendgrid' }
}

const sendWithPostmark = async ({ to, subject, html, templateId, templateModel }) => {
  const config = getEmailConfig()
  const parsedTemplateId = Number(templateId)
  const hasNumericTemplateId = Number.isInteger(parsedTemplateId) && parsedTemplateId > 0

  const payload = templateId
    ? {
        From: config.fromAddress,
        To: to,
        ...(hasNumericTemplateId ? { TemplateId: parsedTemplateId } : { TemplateAlias: templateId }),
        TemplateModel: templateModel,
      }
    : {
        From: config.fromAddress,
        To: to,
        Subject: subject,
        HtmlBody: html,
      }

  const response = await fetch(EMAIL_API_BASE.postmark, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': config.postmarkApiKey,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Postmark email failed (${response.status}): ${body || 'Unknown error'}`)
  }

  return { delivered: true, provider: 'postmark' }
}

const sendWithProvider = async (kind, { to, token, expiresAt }) => {
  const config = getEmailConfig()
  const isVerification = kind === 'verification'
  const link = isVerification
    ? buildVerifyLink({ baseUrl: config.appBaseUrl, token })
    : buildResetLink({ baseUrl: config.appBaseUrl, token })

  const subject = isVerification ? 'Verify your 0xMarket email' : 'Reset your 0xMarket password'
  const html = isVerification
    ? `<p>Verify your email to continue.</p><p><a href="${link}">Verify account</a></p><p>Token: ${token}</p><p>Expires: ${buildExpiryLabel(expiresAt)}</p>`
    : `<p>Use this link to reset your password.</p><p><a href="${link}">Reset password</a></p><p>Token: ${token}</p><p>Expires: ${buildExpiryLabel(expiresAt)}</p>`

  if (config.provider === 'sendgrid') {
    const templateId = isVerification
      ? config.sendgridVerificationTemplateId || null
      : config.sendgridResetTemplateId || null
    return sendWithSendgrid({
      to,
      subject,
      html,
      templateId,
      dynamicTemplateData: {
        subject,
        token,
        expiresAt: buildExpiryLabel(expiresAt),
        link,
      },
    })
  }

  if (config.provider === 'postmark') {
    const templateId = isVerification
      ? config.postmarkVerificationTemplateId || null
      : config.postmarkResetTemplateId || null
    return sendWithPostmark({
      to,
      subject,
      html,
      templateId,
      templateModel: {
        subject,
        token,
        expiresAt: buildExpiryLabel(expiresAt),
        link,
      },
    })
  }

  return sendLocal({ kind, to, token, expiresAt })
}

const sendVerificationEmail = async ({ to, token, expiresAt }) => {
  return sendWithProvider('verification', { to, token, expiresAt })
}

const sendPasswordResetEmail = async ({ to, token, expiresAt }) => {
  return sendWithProvider('password-reset', { to, token, expiresAt })
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
}