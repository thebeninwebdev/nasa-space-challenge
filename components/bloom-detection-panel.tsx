"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flower2, TrendingUp, Calendar, AlertCircle } from "lucide-react"
import type { BloomEvent, BloomPrediction } from "@/lib/bloom-detection"
import { analyzeBloomPatterns } from "@/lib/bloom-detection"

interface BloomDetectionPanelProps {
  events: BloomEvent[]
  predictions: BloomPrediction[]
}

export function BloomDetectionPanel({ events, predictions }: BloomDetectionPanelProps) {
  const analysis = analyzeBloomPatterns(events)

  const getIntensityColor = (intensity: BloomEvent["intensity"]) => {
    switch (intensity) {
      case "extreme":
        return "bg-destructive text-destructive-foreground"
      case "high":
        return "bg-accent text-accent-foreground"
      case "moderate":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getLikelihoodColor = (likelihood: BloomPrediction["likelihood"]) => {
    switch (likelihood) {
      case "high":
        return "bg-primary text-primary-foreground"
      case "moderate":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Bloom Events */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-primary" />
            Detected Bloom Events
          </CardTitle>
          <CardDescription>Historical blooming events identified from NDVI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-foreground">
                        Bloom Event {idx + 1}
                        <Badge className={`ml-2 ${getIntensityColor(event.intensity)}`}>{event.intensity}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Peak:{" "}
                        {new Date(event.peakDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">NDVI: {event.peakNDVI.toFixed(3)}</div>
                      <div className="text-xs text-muted-foreground">{event.confidence.toFixed(0)}% confidence</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Duration:{" "}
                    {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                    {event.endDate
                      ? new Date(event.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "Ongoing"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Flower2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No significant bloom events detected in the current data range</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bloom Predictions */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Bloom Predictions
          </CardTitle>
          <CardDescription>Forecasted blooming events based on historical patterns</CardDescription>
        </CardHeader>
        <CardContent>
          {predictions.length > 0 ? (
            <div className="space-y-4">
              {predictions.map((prediction, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4 bg-accent/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Predicted Bloom
                        <Badge className={getLikelihoodColor(prediction.likelihood)}>
                          {prediction.likelihood} likelihood
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Expected:{" "}
                        {new Date(prediction.predictedDate).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">{prediction.confidence.toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Confidence</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground">Contributing Factors:</div>
                    {prediction.factors.map((factor, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Insufficient historical data to generate bloom predictions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pattern Analysis */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Bloom Pattern Analysis</CardTitle>
          <CardDescription>Statistical insights from detected bloom events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="border border-border rounded-lg p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Average Intensity</div>
              <div className="text-lg font-semibold text-foreground">{analysis.averageIntensity}</div>
            </div>
            <div className="border border-border rounded-lg p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Bloom Frequency</div>
              <div className="text-lg font-semibold text-foreground">{analysis.bloomFrequency}</div>
            </div>
            <div className="border border-border rounded-lg p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Seasonal Pattern</div>
              <div className="text-lg font-semibold text-foreground">{analysis.seasonalPattern}</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Key Insights:</div>
            {analysis.insights.map((insight, i) => (
              <div key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
