const fs = require('fs')

function parseCsvRows(input) {
  return input
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(',').map((value) => value.trim()))
}

function normalizeRow(headers, values) {
  return headers.reduce((acc, header, index) => {
    acc[header] = values[index] || ''
    return acc
  }, {})
}

function importCsv(text) {
  const [headerRow, ...dataRows] = parseCsvRows(text)
  return dataRows.map((row) => normalizeRow(headerRow, row))
}

if (require.main === module) {
  const filePath = process.argv[2]
  const text = fs.readFileSync(filePath, 'utf8')
  console.log(JSON.stringify(importCsv(text), null, 2))
}

module.exports = { importCsv }
