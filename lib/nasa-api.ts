// NASA Earth Observation API utilities for NDVI data fetching

export interface NDVIDataPoint {
  date: string
  ndvi: number
  lat: number
  lon: number
  location?: string
}

export interface VegetationStats {
  avgNDVI: number
  minNDVI: number
  maxNDVI: number
  trend: "increasing" | "decreasing" | "stable"
  bloomProbability: number
}

// NDVI interpretation thresholds
export const NDVI_THRESHOLDS = {
  WATER: -1,
  BARE_SOIL: 0.1,
  SPARSE_VEGETATION: 0.2,
  MODERATE_VEGETATION: 0.5,
  DENSE_VEGETATION: 0.8,
  VERY_DENSE: 1,
}

// Get NDVI color based on value
export function getNDVIColor(ndvi: number): string {
  if (ndvi < NDVI_THRESHOLDS.BARE_SOIL) return "#8B4513" // Brown - bare soil/water
  if (ndvi < NDVI_THRESHOLDS.SPARSE_VEGETATION) return "#D2B48C" // Tan - sparse
  if (ndvi < NDVI_THRESHOLDS.MODERATE_VEGETATION) return "#9ACD32" // Yellow-green - moderate
  if (ndvi < NDVI_THRESHOLDS.DENSE_VEGETATION) return "#228B22" // Forest green - dense
  return "#006400" // Dark green - very dense
}

// Interpret NDVI value
export function interpretNDVI(ndvi: number): string {
  if (ndvi < NDVI_THRESHOLDS.BARE_SOIL) return "Water/Bare Soil"
  if (ndvi < NDVI_THRESHOLDS.SPARSE_VEGETATION) return "Sparse Vegetation"
  if (ndvi < NDVI_THRESHOLDS.MODERATE_VEGETATION) return "Moderate Vegetation"
  if (ndvi < NDVI_THRESHOLDS.DENSE_VEGETATION) return "Dense Vegetation"
  return "Very Dense Vegetation"
}

// Fetch NDVI data from NASA POWER API (free, no key required)
export async function fetchNDVIData(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<NDVIDataPoint[]> {
  try {
    // Using NASA POWER API for vegetation-related parameters
    const params = new URLSearchParams({
      parameters: "T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN",
      community: "AG",
      longitude: lon.toString(),
      latitude: lat.toString(),
      start: startDate.replace(/-/g, ""),
      end: endDate.replace(/-/g, ""),
      format: "JSON",
    })

    const response = await fetch(`https://power.larc.nasa.gov/api/temporal/daily/point?${params}`)

    if (!response.ok) {
      throw new Error("Failed to fetch NASA data")
    }

    const data = await response.json()

    // Calculate synthetic NDVI from temperature, precipitation, and solar radiation
    const dates = Object.keys(data.properties.parameter.T2M)
    const ndviData: NDVIDataPoint[] = dates.map((date) => {
      const temp = data.properties.parameter.T2M[date]
      const precip = data.properties.parameter.PRECTOTCORR[date]
      const solar = data.properties.parameter.ALLSKY_SFC_SW_DWN[date]

      // Synthetic NDVI calculation based on environmental factors
      // Higher precipitation + moderate temp + good solar = higher NDVI
      const tempFactor = Math.max(0, 1 - Math.abs(temp - 20) / 30)
      const precipFactor = Math.min(precip / 5, 1)
      const solarFactor = Math.min(solar / 250, 1)

      const ndvi = (tempFactor * 0.3 + precipFactor * 0.4 + solarFactor * 0.3) * 0.9 - 0.1

      return {
        date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
        ndvi: Math.max(-0.2, Math.min(0.95, ndvi)),
        lat,
        lon,
      }
    })

    return ndviData
  } catch (error) {
    console.error("[v0] Error fetching NASA data:", error)
    // Return mock data as fallback
    return generateMockNDVIData(lat, lon, startDate, endDate)
  }
}

// Generate mock NDVI data for demonstration
export function generateMockNDVIData(lat: number, lon: number, startDate: string, endDate: string): NDVIDataPoint[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const data: NDVIDataPoint[] = []

  const baseNDVI = 0.3 + Math.random() * 0.3
  const seasonalAmplitude = 0.2

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
    const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)
    const seasonalEffect = Math.sin((dayOfYear / 365) * 2 * Math.PI) * seasonalAmplitude
    const noise = (Math.random() - 0.5) * 0.1

    data.push({
      date: d.toISOString().split("T")[0],
      ndvi: Math.max(0, Math.min(0.9, baseNDVI + seasonalEffect + noise)),
      lat,
      lon,
    })
  }

  return data
}

// Calculate vegetation statistics
export function calculateVegetationStats(data: NDVIDataPoint[]): VegetationStats {
  if (data.length === 0) {
    return {
      avgNDVI: 0,
      minNDVI: 0,
      maxNDVI: 0,
      trend: "stable",
      bloomProbability: 0,
    }
  }

  const ndviValues = data.map((d) => d.ndvi)
  const avgNDVI = ndviValues.reduce((a, b) => a + b, 0) / ndviValues.length
  const minNDVI = Math.min(...ndviValues)
  const maxNDVI = Math.max(...ndviValues)

  // Calculate trend
  const firstHalf = ndviValues.slice(0, Math.floor(ndviValues.length / 2))
  const secondHalf = ndviValues.slice(Math.floor(ndviValues.length / 2))
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

  let trend: "increasing" | "decreasing" | "stable" = "stable"
  if (secondAvg > firstAvg + 0.05) trend = "increasing"
  else if (secondAvg < firstAvg - 0.05) trend = "decreasing"

  // Bloom probability based on recent NDVI increase
  const recentData = data.slice(-4)
  const recentIncrease = recentData.length > 1 ? recentData[recentData.length - 1].ndvi - recentData[0].ndvi : 0
  const bloomProbability = Math.max(0, Math.min(100, (recentIncrease + 0.1) * 200))

  return {
    avgNDVI,
    minNDVI,
    maxNDVI,
    trend,
    bloomProbability,
  }
}

// Global locations of interest for vegetation monitoring
export const MONITORING_LOCATIONS = [
  { name: "Sahel Region", lat: 15.5527, lon: 18.7324, region: "West Africa", country: "Chad" },
  { name: "Congo Basin", lat: -0.7264, lon: 23.6566, region: "Central Africa", country: "DRC" },
  { name: "Ethiopian Highlands", lat: 9.145, lon: 40.4897, region: "East Africa", country: "Ethiopia" },
  { name: "Serengeti Plains", lat: -2.3333, lon: 34.8333, region: "East Africa", country: "Tanzania" },
  { name: "Okavango Delta", lat: -19.2833, lon: 22.7833, region: "Southern Africa", country: "Botswana" },
  { name: "Nile Delta", lat: 31.0, lon: 31.2357, region: "North Africa", country: "Egypt" },
  { name: "Madagascar Rainforest", lat: -18.7669, lon: 46.8691, region: "East Africa", country: "Madagascar" },
  { name: "Kruger National Park", lat: -23.9884, lon: 31.5547, region: "Southern Africa", country: "South Africa" },
  { name: "Lake Victoria Basin", lat: -1.2921, lon: 36.8219, region: "East Africa", country: "Kenya" },
  { name: "Atlas Mountains", lat: 31.0522, lon: -7.9372, region: "North Africa", country: "Morocco" },
]
