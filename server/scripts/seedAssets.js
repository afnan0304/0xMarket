const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Asset = require('../models/Asset')

dotenv.config()

const seedData = [
  {
    name: 'Zero-Day Recon Pack',
    description: 'Automated recon scripts for bug bounty surface mapping.',
    btcPrice: 1.15,
    category: 'security',
    isEncrypted: true,
  },
  {
    name: 'Stealth Proxy Mesh',
    description: 'Multi-hop proxy config bundle for hardened routing.',
    btcPrice: 0.62,
    category: 'networking',
    isEncrypted: true,
  },
  {
    name: 'Terminal UI Theme Kit',
    description: 'Cyberpunk terminal themes for dashboards and CLIs.',
    btcPrice: 0.18,
    category: 'ui',
    isEncrypted: false,
  },
  {
    name: 'Incident Response Playbooks',
    description: 'IR markdown playbooks for SOC triage and escalation.',
    btcPrice: 0.44,
    category: 'ops',
    isEncrypted: false,
  },
  {
    name: 'OSINT Workflow Automator',
    description: 'Pipelines for username, domain, and breach correlation.',
    btcPrice: 0.77,
    category: 'intel',
    isEncrypted: true,
  },
  {
    name: 'Smart Contract Audit Notes',
    description: 'Static review checklist and findings templates.',
    btcPrice: 0.39,
    category: 'web3',
    isEncrypted: false,
  },
  {
    name: 'Container Escape Lab',
    description: 'Educational lab configs for container hardening drills.',
    btcPrice: 0.58,
    category: 'devsecops',
    isEncrypted: true,
  },
  {
    name: 'SOC Alert Noise Filter',
    description: 'Rule presets to reduce false positives in SIEM feeds.',
    btcPrice: 0.29,
    category: 'defense',
    isEncrypted: false,
  },
]

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
