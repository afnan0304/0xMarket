const mongoose = require('mongoose')

const connectDB = async ({ required = false } = {}) => {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    const message = 'MONGO_URI is not defined. Add it to server/.env before starting the server.'

    if (required) {
      throw new Error(message)
    }

    console.warn(message)
    return false
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('MongoDB connected')
    return true
  } catch (error) {
    if (required) {
      throw error
    }

    console.warn(`MongoDB unavailable, running in fallback mode: ${error.message}`)
    return false
  }
}

module.exports = connectDB
