const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const path = require('path')
const fs = require('fs')

dotenv.config()

const connectDB = require('./config/db')
const healthRoute = require('./routes/health')
const geminiRoute = require('./routes/gemini')
const assetsRoute = require('./routes/assets')
const authRoute = require('./routes/auth')
const ordersRoute = require('./routes/orders')
const { validateEmailConfig } = require('./config/email')
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173'

const allowedOrigins = CLIENT_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.disable('x-powered-by')
app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

const sanitizeNoSqlKeys = (value) => {
  if (!value || typeof value !== 'object') {
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      sanitizeNoSqlKeys(item)
    }
    return
  }

  for (const key of Object.keys(value)) {
    const currentValue = value[key]
    sanitizeNoSqlKeys(currentValue)

    if (!key.includes('$') && !key.includes('.')) {
      continue
    }

    const safeKey = key.replace(/\$/g, '').replace(/\./g, '_')
    if (safeKey && !(safeKey in value)) {
      value[safeKey] = currentValue
    }
    delete value[key]
  }
}

app.use((req, _res, next) => {
  sanitizeNoSqlKeys(req.body)
  sanitizeNoSqlKeys(req.params)
  sanitizeNoSqlKeys(req.query)
  next()
})

app.use('/api/health', healthRoute)
app.use('/api/auth', authRoute)
app.use('/api/gemini', geminiRoute)
app.use('/api', assetsRoute)
app.use('/api', ordersRoute)

// Serve static files from client build
const clientDistPath = path.join(__dirname, '../client/dist')
app.use(express.static(clientDistPath, {
  maxAge: '1d',
  etag: false,
}))

// SPA fallback: serve index.html for all non-API routes
//app.get('/(.*)', (req, res) => {
// const indexPath = path.join(clientDistPath, 'index.html')
//  if (fs.existsSync(indexPath)) {
//    res.sendFile(indexPath)
//  } else {
//    res.status(404).json({ error: 'Client build not found' })
//  }
//})

app.use(notFoundHandler)
app.use(errorHandler)

connectDB({ required: true })
  .then(() => {
    validateEmailConfig()

    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    }
  })
  .catch((error) => console.log(error))

module.exports = app
