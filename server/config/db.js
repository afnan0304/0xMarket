const mongoose = require('mongoose')

const connectDB = async ({ required = false } = {}) => {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    const message = 'MONGO_URI is not defined. Starting server without database connection.'

    if (required) {
      throw new Error(message)
    }

    console.warn(message)
    return false
  }

  await mongoose.connect(mongoUri)
  console.log('MongoDB connected')
  return true
}

module.exports = connectDB
