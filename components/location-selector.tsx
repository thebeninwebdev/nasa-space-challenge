"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Leaf } from "lucide-react"
import { MONITORING_LOCATIONS } from "@/lib/nasa-api"

interface LocationSelectorProps {
  selectedLocation?: { lat: number; lon: number; name: string }
  onLocationSelect: (lat: number, lon: number, name: string) => void
}

export function LocationSelector({ selectedLocation, onLocationSelect }: LocationSelectorProps) {
  return (
    <Card className="p-4 bg-card border-primary/20">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
          <Leaf className="w-4 h-4 text-primary" />
          African Vegetation Sites
        </h3>
        <p className="text-xs text-muted-foreground">Select a location to monitor plant blooming and NDVI data</p>
      </div>
      <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
        {MONITORING_LOCATIONS.map((location) => {
          const isSelected =
            selectedLocation &&
            Math.abs(selectedLocation.lat - location.lat) < 0.1 &&
            Math.abs(selectedLocation.lon - location.lon) < 0.1

          return (
            <Button
              key={location.name}
              variant={isSelected ? "default" : "ghost"}
              className="w-full justify-start text-left h-auto py-2 sm:py-3 hover:bg-primary/10 transition-all"
              onClick={() => onLocationSelect(location.lat, location.lon, location.name)}
            >
              <div className="flex-1">
                <div className="font-medium text-xs sm:text-sm flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {location.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {location.country} • {location.region}
                </div>
                <div className="text-xs text-muted-foreground">
                  {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
                </div>
              </div>
            </Button>
          )
        })}
      </div>
    </Card>
  )
}
