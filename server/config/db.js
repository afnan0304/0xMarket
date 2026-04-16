const mongoose = require('mongoose')

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    console.warn('MONGO_URI is not defined. Starting server without database connection.')
    return
  }

  await mongoose.connect(mongoUri)
  console.log('MongoDB connected')
}

module.exports = connectDB
