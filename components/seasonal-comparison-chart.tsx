"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { NDVIDataPoint } from "@/lib/nasa-api"

interface SeasonalComparisonChartProps {
  data: NDVIDataPoint[]
}

export function SeasonalComparisonChart({ data }: SeasonalComparisonChartProps) {
  // Group data by month and calculate averages
  const monthlyData = data.reduce(
    (acc, point) => {
      const month = new Date(point.date).toLocaleDateString("en-US", { month: "short" })
      if (!acc[month]) {
        acc[month] = { sum: 0, count: 0 }
      }
      acc[month].sum += point.ndvi
      acc[month].count += 1
      return acc
    },
    {} as Record<string, { sum: number; count: number }>,
  )

  const chartData = Object.entries(monthlyData).map(([month, { sum, count }]) => ({
    month,
    avgNDVI: Number((sum / count).toFixed(3)),
  }))

  // Sort by month order
  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  chartData.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))

  return (
    <Card className="bg-card w-full">
      <CardHeader>
        <CardTitle className="text-foreground">Seasonal Patterns</CardTitle>
        <CardDescription>Average NDVI by month</CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden max-w-full">
        <ChartContainer
          config={{
            avgNDVI: {
              label: "Average NDVI",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 1]}
              />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} />
              <Bar dataKey="avgNDVI" fill="var(--color-avgNDVI)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
