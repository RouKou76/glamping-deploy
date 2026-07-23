const fs = require('fs')
const path = require('path')

const REF_LAT = 57.053845
const REF_LON = 41.314958
const ALLOWED_PLACES = new Set(['city', 'town', 'village', 'hamlet'])

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function getDistancePrice(km) {
  if (km <= 35) return 500
  if (km <= 50) return 700
  return 1000
}

const filePath = process.argv[2] || path.join(__dirname, '..', 'export.json')
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

const results = data.elements
  .filter(e => e.tags && e.tags.name && e.tags.place && ALLOWED_PLACES.has(e.tags.place))
  .map(e => {
    const lat = e.lat || e.center?.lat
    const lon = e.lon || e.center?.lon
    if (!lat || !lon) return null
    const km = haversine(REF_LAT, REF_LON, lat, lon)
    return { name: e.tags.name, km, price: getDistancePrice(km) }
  })
  .filter(Boolean)
  .sort((a, b) => a.km - b.km)

const seen = new Map()
for (const item of results) {
  const existing = seen.get(item.name)
  if (!existing || item.km < existing.km) {
    seen.set(item.name, item)
  }
}
const deduped = [...seen.values()].sort((a, b) => a.km - b.km)

console.log(`Всего: ${results.length}, уникальных: ${deduped.length}`)
console.log(JSON.stringify(deduped, null, 2))
