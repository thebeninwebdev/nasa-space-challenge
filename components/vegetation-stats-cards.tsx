import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, Leaf, Droplets, Sun } from "lucide-react"
import type { VegetationStats } from "@/lib/nasa-api"
import { interpretNDVI } from "@/lib/nasa-api"

interface VegetationStatsCardsProps {
  stats: VegetationStats
}

export function VegetationStatsCards({ stats }: VegetationStatsCardsProps) {
  const getTrendIcon = () => {
    if (stats.trend === "increasing") return <TrendingUp className="w-4 h-4 text-primary" />
    if (stats.trend === "decreasing") return <TrendingDown className="w-4 h-4 text-destructive" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  const getTrendColor = () => {
    if (stats.trend === "increasing") return "text-primary"
    if (stats.trend === "decreasing") return "text-destructive"
    return "text-muted-foreground"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Average NDVI</CardTitle>
          <Leaf className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.avgNDVI.toFixed(3)}</div>
          <p className="text-xs text-muted-foreground mt-1">{interpretNDVI(stats.avgNDVI)}</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Trend</CardTitle>
          {getTrendIcon()}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold capitalize ${getTrendColor()}`}>{stats.trend}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Range: {stats.minNDVI.toFixed(3)} - {stats.maxNDVI.toFixed(3)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Bloom Probability</CardTitle>
          <Sun className="w-4 h-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.bloomProbability.toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.bloomProbability > 60 ? "High likelihood" : stats.bloomProbability > 30 ? "Moderate" : "Low"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Health Status</CardTitle>
          <Droplets className="w-4 h-4 text-chart-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.avgNDVI > 0.6 ? "Excellent" : stats.avgNDVI > 0.4 ? "Good" : stats.avgNDVI > 0.2 ? "Fair" : "Poor"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Based on current NDVI</p>
        </CardContent>
      </Card>
    </div>
  )
}
