import type { NDVIDataPoint } from "./nasa-api"

export interface BloomEvent {
  startDate: string
  peakDate: string
  endDate?: string
  peakNDVI: number
  intensity: "low" | "moderate" | "high" | "extreme"
  confidence: number
}

export interface BloomPrediction {
  predictedDate: string
  confidence: number
  factors: string[]
  likelihood: "low" | "moderate" | "high"
}

// Detect bloom events from NDVI time series data
export function detectBloomEvents(data: NDVIDataPoint[]): BloomEvent[] {
  if (data.length < 5) return []

  const events: BloomEvent[] = []
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calculate moving average for smoothing
  const windowSize = 3
  const smoothedData = sortedData.map((point, i) => {
    const start = Math.max(0, i - Math.floor(windowSize / 2))
    const end = Math.min(sortedData.length, i + Math.ceil(windowSize / 2))
    const window = sortedData.slice(start, end)
    const avgNDVI = window.reduce((sum, p) => sum + p.ndvi, 0) / window.length

    return { ...point, smoothedNDVI: avgNDVI }
  })

  // Detect peaks (local maxima)
  for (let i = 2; i < smoothedData.length - 2; i++) {
    const current = smoothedData[i]
    const prev = smoothedData[i - 1]
    const next = smoothedData[i + 1]

    // Check if this is a local maximum
    if (current.smoothedNDVI > prev.smoothedNDVI && current.smoothedNDVI > next.smoothedNDVI) {
      // Check if the increase is significant (bloom threshold)
      const baselineNDVI = smoothedData.slice(Math.max(0, i - 5), i).reduce((sum, p) => sum + p.smoothedNDVI, 0) / 5
      const increase = current.smoothedNDVI - baselineNDVI

      if (increase > 0.1 && current.smoothedNDVI > 0.3) {
        // Find start of bloom (where NDVI starts increasing)
        let startIdx = i
        for (let j = i - 1; j >= 0; j--) {
          if (smoothedData[j].smoothedNDVI < baselineNDVI + 0.05) {
            startIdx = j + 1
            break
          }
        }

        // Find end of bloom (where NDVI drops back down)
        let endIdx = i
        for (let j = i + 1; j < smoothedData.length; j++) {
          if (smoothedData[j].smoothedNDVI < current.smoothedNDVI - 0.1) {
            endIdx = j
            break
          }
        }

        // Determine intensity
        let intensity: BloomEvent["intensity"] = "low"
        if (increase > 0.3) intensity = "extreme"
        else if (increase > 0.2) intensity = "high"
        else if (increase > 0.15) intensity = "moderate"

        // Calculate confidence based on data quality and pattern clarity
        const confidence = Math.min(95, 60 + increase * 100)

        events.push({
          startDate: sortedData[startIdx].date,
          peakDate: current.date,
          endDate: endIdx > i ? sortedData[endIdx].date : undefined,
          peakNDVI: current.ndvi,
          intensity,
          confidence,
        })
      }
    }
  }

  return events
}

// Predict future bloom events based on historical patterns
export function predictBloomEvents(data: NDVIDataPoint[]): BloomPrediction[] {
  if (data.length < 30) return []

  const predictions: BloomPrediction[] = []
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Analyze historical bloom patterns
  const historicalBlooms = detectBloomEvents(sortedData)

  if (historicalBlooms.length === 0) return []

  // Calculate average bloom timing
  const bloomMonths = historicalBlooms.map((bloom) => new Date(bloom.peakDate).getMonth())
  const avgBloomMonth = Math.round(bloomMonths.reduce((sum, m) => sum + m, 0) / bloomMonths.length)

  // Get current trend
  const recentData = sortedData.slice(-10)
  const recentAvg = recentData.reduce((sum, p) => sum + p.ndvi, 0) / recentData.length
  const olderData = sortedData.slice(-20, -10)
  const olderAvg = olderData.reduce((sum, p) => sum + p.ndvi, 0) / olderData.length
  const trend = recentAvg - olderAvg

  // Predict next bloom
  const lastDate = new Date(sortedData[sortedData.length - 1].date)
  const currentMonth = lastDate.getMonth()

  // Calculate months until predicted bloom
  let monthsUntilBloom = avgBloomMonth - currentMonth
  if (monthsUntilBloom <= 0) monthsUntilBloom += 12

  const predictedDate = new Date(lastDate)
  predictedDate.setMonth(predictedDate.getMonth() + monthsUntilBloom)

  // Determine factors
  const factors: string[] = []
  if (trend > 0.05) factors.push("Increasing vegetation trend")
  if (recentAvg > 0.4) factors.push("High baseline vegetation")
  if (historicalBlooms.length > 2) factors.push("Consistent historical pattern")
  factors.push(`Historical blooms in ${new Date(2000, avgBloomMonth).toLocaleDateString("en-US", { month: "long" })}`)

  // Calculate confidence and likelihood
  const patternConsistency = historicalBlooms.length >= 3 ? 0.3 : 0.1
  const trendFactor = Math.max(0, Math.min(0.3, trend * 2))
  const baselineFactor = Math.max(0, Math.min(0.4, recentAvg * 0.5))
  const confidence = Math.min(85, (patternConsistency + trendFactor + baselineFactor) * 100)

  let likelihood: BloomPrediction["likelihood"] = "low"
  if (confidence > 60) likelihood = "high"
  else if (confidence > 40) likelihood = "moderate"

  predictions.push({
    predictedDate: predictedDate.toISOString().split("T")[0],
    confidence,
    factors,
    likelihood,
  })

  return predictions
}

// Analyze bloom patterns and provide insights
export function analyzeBloomPatterns(events: BloomEvent[]): {
  averageIntensity: string
  bloomFrequency: string
  seasonalPattern: string
  insights: string[]
} {
  if (events.length === 0) {
    return {
      averageIntensity: "No blooms detected",
      bloomFrequency: "Insufficient data",
      seasonalPattern: "Unknown",
      insights: ["Not enough data to analyze bloom patterns"],
    }
  }

  // Calculate average intensity
  const intensityScores = events.map((e) => {
    switch (e.intensity) {
      case "extreme":
        return 4
      case "high":
        return 3
      case "moderate":
        return 2
      default:
        return 1
    }
  })
  const avgIntensityScore = intensityScores.reduce((sum, s) => sum + s, 0) / intensityScores.length
  const averageIntensity =
    avgIntensityScore > 3.5
      ? "Extreme"
      : avgIntensityScore > 2.5
        ? "High"
        : avgIntensityScore > 1.5
          ? "Moderate"
          : "Low"

  // Calculate bloom frequency
  const bloomFrequency = events.length > 3 ? "Frequent" : events.length > 1 ? "Occasional" : "Rare"

  // Determine seasonal pattern
  const bloomMonths = events.map((e) => new Date(e.peakDate).getMonth())
  const springBlooms = bloomMonths.filter((m) => m >= 2 && m <= 4).length
  const summerBlooms = bloomMonths.filter((m) => m >= 5 && m <= 7).length
  const fallBlooms = bloomMonths.filter((m) => m >= 8 && m <= 10).length
  const winterBlooms = bloomMonths.filter((m) => m === 11 || m <= 1).length

  let seasonalPattern = "Variable"
  if (springBlooms > summerBlooms && springBlooms > fallBlooms) seasonalPattern = "Spring-dominant"
  else if (summerBlooms > springBlooms && summerBlooms > fallBlooms) seasonalPattern = "Summer-dominant"
  else if (fallBlooms > springBlooms && fallBlooms > summerBlooms) seasonalPattern = "Fall-dominant"

  // Generate insights
  const insights: string[] = []
  insights.push(`Detected ${events.length} bloom event${events.length > 1 ? "s" : ""} in the analyzed period`)

  const highIntensityBlooms = events.filter((e) => e.intensity === "high" || e.intensity === "extreme").length
  if (highIntensityBlooms > 0) {
    insights.push(`${highIntensityBlooms} high-intensity bloom${highIntensityBlooms > 1 ? "s" : ""} observed`)
  }

  if (seasonalPattern !== "Variable") {
    insights.push(`Clear ${seasonalPattern.toLowerCase()} blooming pattern`)
  }

  const avgConfidence = events.reduce((sum, e) => sum + e.confidence, 0) / events.length
  if (avgConfidence > 70) {
    insights.push("High confidence in bloom detection accuracy")
  }

  return {
    averageIntensity,
    bloomFrequency,
    seasonalPattern,
    insights,
  }
}
