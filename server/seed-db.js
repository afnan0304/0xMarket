#!/usr/bin/env node

/**
 * Quick database seeding utility
 * Usage: node seed-db.js
 */

const dotenv = require('dotenv')
const mongoose = require('mongoose')
const Asset = require('./models/Asset')
const seedData = require('./data/catalogAssets')

dotenv.config()

const seed = async () => {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    console.error('❌ MONGO_URI not found in .env')
    process.exit(1)
  }

  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected')

    console.log('🧹 Clearing existing assets...')
    await Asset.deleteMany({})
    console.log('✅ Cleared')

    console.log(`📥 Inserting ${seedData.length} assets...`)
    const result = await Asset.insertMany(seedData)
    console.log(`✅ Seeded ${result.length} assets`)

    console.log('\n📋 Asset Summary:')
    result.forEach((asset, i) => {
      console.log(`  ${i + 1}. ${asset.name} (${asset.btcPrice} BTC)`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error.message)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
  }
}

seed()
