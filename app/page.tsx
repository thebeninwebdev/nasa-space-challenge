"use client"

import { useState, useEffect } from "react"
import { Leaf, Calendar, Download, Sparkles, TrendingUp } from "lucide-react"
import { VegetationMap } from "@/components/vegetation-map"
import { LocationSelector } from "@/components/location-selector"
import { NDVILegend } from "@/components/ndvi-legend"
import { NDVITimeSeriesChart } from "@/components/ndvi-time-series-chart"
import { VegetationStatsCards } from "@/components/vegetation-stats-cards"
import { SeasonalComparisonChart } from "@/components/seasonal-comparison-chart"
import { BloomDetectionPanel } from "@/components/bloom-detection-panel"
import { SatelliteImageryModal } from "@/components/satellite-imagery-modal"
import { WelcomeScreen } from "@/components/welcome-screen"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { NDVIDataPoint, VegetationStats } from "@/lib/nasa-api"
import { calculateVegetationStats } from "@/lib/nasa-api"
import { detectBloomEvents, predictBloomEvents } from "@/lib/bloom-detection"
import type { BloomEvent, BloomPrediction } from "@/lib/bloom-detection"

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number; name: string } | undefined>()
  const [imageryModalOpen, setImageryModalOpen] = useState(false)
  const [ndviData, setNdviData] = useState<NDVIDataPoint[]>([])
  const [stats, setStats] = useState<VegetationStats | null>(null)
  const [bloomEvents, setBloomEvents] = useState<BloomEvent[]>([])
  const [bloomPredictions, setBloomPredictions] = useState<BloomPrediction[]>([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })

  const handleLocationSelect = (lat: number, lon: number, name: string) => {
    setSelectedLocation({ lat, lon, name })
  }

  useEffect(() => {
    if (!selectedLocation) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/ndvi?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&startDate=${dateRange.start}&endDate=${dateRange.end}`,
        )
        const result = await response.json()

        if (result.success && result.data) {
          setNdviData(result.data)
          setStats(calculateVegetationStats(result.data))
          setBloomEvents(detectBloomEvents(result.data))
          setBloomPredictions(predictBloomEvents(result.data))
        }
      } catch (error) {
        console.error("[v0] Error fetching NDVI data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedLocation, dateRange])

  const handleExportData = () => {
    if (ndviData.length === 0) return

    const csvContent = [
      ["Date", "NDVI", "Latitude", "Longitude"],
      ...ndviData.map((d) => [d.date, d.ndvi.toFixed(4), d.lat.toFixed(4), d.lon.toFixed(4)]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ndvi-data-${selectedLocation?.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (showWelcome) {
    return <WelcomeScreen onEnter={() => setShowWelcome(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">Earth Vegetation Monitor</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">NASA Earth Observations • NDVI Analysis</p>
              </div>
            </div>
            {selectedLocation && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none">
                  <div className="text-xs sm:text-sm text-muted-foreground">Selected Location</div>
                  <div className="text-sm sm:text-base font-semibold text-foreground">{selectedLocation.name}</div>
                </div>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleExportData}>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export Data</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-4">
            <LocationSelector selectedLocation={selectedLocation} onLocationSelect={handleLocationSelect} />
            <NDVILegend />

            <Card className="p-4 bg-card">
              <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-4 lg:space-y-6">
            <VegetationMap
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
              onViewImagery={() => setImageryModalOpen(true)}
            />

            {selectedLocation && (
              <>
                {loading ? (
                  <Card className="p-8 text-center bg-card">
                    <div className="text-muted-foreground">Loading vegetation data...</div>
                  </Card>
                ) : ndviData.length > 0 && stats ? (
                  <>
                    <VegetationStatsCards stats={stats} />

                    <Tabs defaultValue="trends" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-muted">
                        <TabsTrigger value="trends" className="gap-2 text-xs sm:text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span className="hidden sm:inline">Trends & Analysis</span>
                          <span className="sm:hidden">Trends</span>
                        </TabsTrigger>
                        <TabsTrigger value="blooms" className="gap-2 text-xs sm:text-sm">
                          <Sparkles className="w-4 h-4" />
                          <span className="hidden sm:inline">Bloom Detection</span>
                          <span className="sm:hidden">Blooms</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="trends" className="space-y-4 lg:space-y-6 mt-4 lg:mt-6 overflow-hidden">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 max-w-full">
                          <NDVITimeSeriesChart
                            data={ndviData}
                            title="NDVI Time Series"
                            description={`Vegetation health trends for ${selectedLocation.name}`}
                          />
                          <SeasonalComparisonChart data={ndviData} />
                        </div>
                      </TabsContent>

                      <TabsContent value="blooms" className="mt-4 lg:mt-6">
                        <BloomDetectionPanel events={bloomEvents} predictions={bloomPredictions} />
                      </TabsContent>
                    </Tabs>
                  </>
                ) : (
                  <Card className="p-8 text-center bg-card">
                    <div className="text-muted-foreground">No data available for this location and date range</div>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <SatelliteImageryModal
        open={imageryModalOpen}
        onOpenChange={setImageryModalOpen}
        location={selectedLocation || null}
        date={dateRange.end}
      />
    </div>
  )
}
