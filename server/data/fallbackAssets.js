const fallbackAssets = require('./catalogAssets').map((asset) => ({
  ...asset,
  _id: asset._id.replace('catalog', 'fallback'),
  source: 'fallback',
}))

module.exports = fallbackAssets
