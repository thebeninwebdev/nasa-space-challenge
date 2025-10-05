// Sentinel Hub API integration for satellite imagery
// Supports multiple visualization layers: True Color, False Color, NDVI

export interface SentinelImageRequest {
  lat: number
  lon: number
  date: string
  width?: number
  height?: number
  zoom?: number
}

export interface SentinelImageResponse {
  trueColor: string
  falseColor: string
  ndviVisualization: string
  metadata: {
    date: string
    cloudCoverage: number
    satellite: string
  }
}

// Calculate bounding box from center point and zoom level
function calculateBbox(lat: number, lon: number, zoom = 13): [number, number, number, number] {
  // Approximate degrees per pixel at different zoom levels
  const metersPerPixel = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom)
  const sizeInMeters = 512 * metersPerPixel
  const degreeOffset = sizeInMeters / 111320 // meters to degrees approximation

  return [lon - degreeOffset, lat - degreeOffset, lon + degreeOffset, lat + degreeOffset]
}

// Sentinel Hub evalscript for True Color (RGB)
const TRUE_COLOR_SCRIPT = `
//VERSION=3
function setup() {
  return {
    input: ["B04", "B03", "B02"],
    output: { bands: 3 }
  };
}
function evaluatePixel(sample) {
  return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
}
`

// Sentinel Hub evalscript for False Color (NIR, Red, Green)
const FALSE_COLOR_SCRIPT = `
//VERSION=3
function setup() {
  return {
    input: ["B08", "B04", "B03"],
    output: { bands: 3 }
  };
}
function evaluatePixel(sample) {
  return [2.5 * sample.B08, 2.5 * sample.B04, 2.5 * sample.B03];
}
`

// Sentinel Hub evalscript for NDVI Visualization
const NDVI_VISUALIZATION_SCRIPT = `
//VERSION=3
function setup() {
  return {
    input: ["B04", "B08"],
    output: { bands: 3 }
  };
}

const ramps = [
  [-0.5, 0x0c0c0c],
  [-0.2, 0xbfbfbf],
  [-0.1, 0xdbdbdb],
  [0, 0xeaeaea],
  [0.025, 0xfff9cc],
  [0.05, 0xede8b5],
  [0.075, 0xddd89b],
  [0.1, 0xccc682],
  [0.125, 0xbcb76b],
  [0.15, 0xafc160],
  [0.175, 0xa3cc59],
  [0.2, 0x91bf51],
  [0.25, 0x7fb247],
  [0.3, 0x70a33f],
  [0.35, 0x609635],
  [0.4, 0x4f892d],
  [0.45, 0x3f7c23],
  [0.5, 0x306d1c],
  [0.55, 0x216011],
  [0.6, 0x0f540a],
  [1, 0x004400],
];

const visualizer = new ColorRampVisualizer(ramps);

function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  let imgVals = visualizer.process(ndvi);
  return imgVals;
}
`

export async function fetchSentinelImage(request: SentinelImageRequest): Promise<SentinelImageResponse> {
  const { lat, lon, date, width = 512, height = 512, zoom = 13 } = request
  const bbox = calculateBbox(lat, lon, zoom)

  // In production, you would use actual Sentinel Hub API
  // For now, we'll use placeholder images with appropriate styling
  const baseUrl = `/placeholder.svg?height=${height}&width=${width}`

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    trueColor: "https://eoimages.gsfc.nasa.gov/images/imagerecords/146000/146644/africa_oli_2017261_lrg.jpg",
    falseColor: "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57736/africa_false_color_lrg.jpg",
    ndviVisualization: "https://earthobservatory.nasa.gov/ContentFeature/Vegetation/images/ndvi_example.jpg",
    metadata: {
      date: date,
      cloudCoverage: Math.random() * 30,
      satellite: "Sentinel-2",
    },
  }
}

// Helper to format coordinates for display
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S"
  const lonDir = lon >= 0 ? "E" : "W"
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`
}
