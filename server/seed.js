const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDB = require('./config/db')
const Asset = require('./models/Asset')

dotenv.config()

const seedAssets = [
  {
    name: 'Kali Nightfall Theme',
    description: 'A terminal-first theme pack with neon accents, clipped shadows, and red-team styling.',
    btcPrice: 0.18,
    category: 'ui',
    isEncrypted: false,
    downloadUrl: null,
  },
  {
    name: 'Zero-Day Exploit Mockup',
    description: 'A harmless demo payload showing how vulnerability notes and remediation steps are packaged.',
    btcPrice: 0.64,
    category: 'scripts',
    isEncrypted: true,
    downloadUrl: null,
  },
  {
    name: 'Phantom Proxy Rotation Kit',
    description: 'A fictional proxy rotation workflow for showing off queue management and retry handling.',
    btcPrice: 0.42,
    category: 'automation',
    isEncrypted: true,
    downloadUrl: null,
  },
  {
    name: 'Dead Drop Ledger',
    description: 'An audit-log template that tracks fictional transfers, approvals, and delivery checkpoints.',
    btcPrice: 0.27,
    category: 'finance',
    isEncrypted: false,
    downloadUrl: null,
  },
  {
    name: 'Ghost Shell Blueprint',
    description: 'A read-only shell prompt concept with animated status markers and command aliases.',
    btcPrice: 0.33,
    category: 'ops',
    isEncrypted: false,
    downloadUrl: null,
  },
  {
    name: 'Red Team Briefcase',
    description: 'A curated collection of fictional engagement notes, checklists, and incident templates.',
    btcPrice: 0.21,
    category: 'support',
    isEncrypted: false,
    downloadUrl: null,
  },
  {
    name: 'Cipher Relay Monitor',
    description: 'A mock monitoring dashboard for watching traffic spikes and flagging suspicious patterns.',
    btcPrice: 0.29,
    category: 'monitoring',
    isEncrypted: false,
    downloadUrl: null,
  },
  {
    name: 'Black ICE Onboarding Flow',
    description: 'A fictional onboarding workflow that showcases secure account provisioning and access control.',
    btcPrice: 0.56,
    category: 'automation',
    isEncrypted: true,
    downloadUrl: null,
  },
]

const run = async () => {
  try {
    await connectDB({ required: true })

    await Asset.deleteMany({})
    await Asset.insertMany(seedAssets)

    console.log(`Seeded ${seedAssets.length} assets.`)
  } catch (error) {
    console.error('Seed failed:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
  }
}

run()