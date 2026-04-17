const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const connectDB = require('./config/db')
const healthRoute = require('./routes/health')
const geminiRoute = require('./routes/gemini')
const assetsRoute = require('./routes/assets')

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: CLIENT_ORIGIN }))
app.use(express.json())

app.use('/api/health', healthRoute)
app.use('/api/gemini', geminiRoute)
app.use('/api/assets', assetsRoute)

connectDB({ required: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  })
