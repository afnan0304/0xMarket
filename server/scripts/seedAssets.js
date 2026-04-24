const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Asset = require('../models/Asset')
const seedData = require('../data/catalogAssets')

dotenv.config()

const seedAssets = async () => {
  try {
    await connectDB({ required: true })

    await Asset.deleteMany({})
    await Asset.insertMany(seedData)

    console.log(`Seeded ${seedData.length} assets.`)
  } catch (error) {
    console.error('Asset seed failed:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
  }
}

seedAssets()
