import { Card } from "@/components/ui/card"

export function NDVILegend() {
  const legendItems = [
    { label: "Water/Bare Soil", color: "#8B4513", range: "< 0.1" },
    { label: "Sparse Vegetation", color: "#D2B48C", range: "0.1 - 0.2" },
    { label: "Moderate Vegetation", color: "#9ACD32", range: "0.2 - 0.5" },
    { label: "Dense Vegetation", color: "#228B22", range: "0.5 - 0.8" },
    { label: "Very Dense Vegetation", color: "#006400", range: "> 0.8" },
  ]

  return (
    <Card className="p-4 bg-card/50 backdrop-blur">
      <h3 className="text-sm font-semibold mb-3 text-foreground">NDVI Legend</h3>
      <div className="space-y-2">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-6 h-4 rounded" style={{ backgroundColor: item.color }} />
            <div className="flex-1">
              <div className="text-xs font-medium text-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.range}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          NDVI (Normalized Difference Vegetation Index) measures vegetation health and density using satellite imagery.
        </p>
      </div>
    </Card>
  )
}
