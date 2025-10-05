// lib/earthdata-snapshot.ts

export interface SnapshotOpts {
  lat: number
  lon: number
  date: string
  spanDeg?: number
  width?: number
  height?: number
  layer: string
}

function calculateBBox(lat: number, lon: number, spanDeg: number): [number, number, number, number] {
  const half = spanDeg / 2
  const west = lon - half
  const east = lon + half
  const south = lat - half
  const north = lat + half
  return [west, south, east, north]
}

export function buildSnapshotUrl(opts: SnapshotOpts): string {
  const {
    lat,
    lon,
    date,
    spanDeg = 0.5,
    width = 800,
    height = 600,
    layer,
  } = opts

  const [west, south, east, north] = calculateBBox(lat, lon, spanDeg)
  const params = new URLSearchParams({
    REQUEST: "GetSnapshot",
    TIME: date,
    BBOX: `${west},${south},${east},${north}`,
    CRS: "EPSG:4326",
    LAYERS: layer,
    WRAP: "DAY",
    FORMAT: "image/jpeg",
    WIDTH: width.toString(),
    HEIGHT: height.toString(),
    KEY: process.env.NASA_API_KEY ?? "",  // beware: this may expose key in URL – better is proxy / sign usage
  })

  return `https://wvs.earthdata.nasa.gov/api/v1/snapshot?${params.toString()}`
}
