const https = require('https')

function ping(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      resolve({ statusCode: response.statusCode, ok: response.statusCode >= 200 && response.statusCode < 400 })
      response.resume()
    })

    request.on('error', reject)
  })
}

module.exports = { ping }
