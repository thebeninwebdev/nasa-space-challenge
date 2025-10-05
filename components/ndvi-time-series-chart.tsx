"use client"

import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { NDVIDataPoint } from "@/lib/nasa-api"
import { NDVI_THRESHOLDS } from "@/lib/nasa-api"

interface NDVITimeSeriesChartProps {
  data: NDVIDataPoint[]
  title?: string
  description?: string
}

export function NDVITimeSeriesChart({ data, title, description }: NDVITimeSeriesChartProps) {
  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ndvi: Number(point.ndvi.toFixed(3)),
    fullDate: point.date,
  }))

  return (
    <Card className="bg-card w-full">
      <CardHeader>
        <CardTitle className="text-foreground">{title || "NDVI Time Series"}</CardTitle>
        <CardDescription>{description || "Vegetation index over time"}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden max-w-full">
        <ChartContainer
          config={{
            ndvi: {
              label: "NDVI",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
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
                domain={[-0.2, 1]}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
              />
              <ReferenceLine
                y={NDVI_THRESHOLDS.MODERATE_VEGETATION}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                opacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="ndvi"
                stroke="var(--color-ndvi)"
                strokeWidth={2}
                fill="url(#ndviGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
