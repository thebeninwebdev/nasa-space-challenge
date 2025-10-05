"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { Badge } from "@/components/ui/badge"
import {
  Satellite,
  Eye,
  Calendar,
  MapPin,
} from "lucide-react"

interface ImageryResponse {
  trueColor: string
  metadata: {
    date: string
    satellite: string
  }
  error?: string
}

interface SatelliteImageryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: {
    lat: number
    lon: number
    name: string
  } | null
  date?: string
}

export function SatelliteImageryModal({
  open,
  onOpenChange,
  location,
  date,
}: SatelliteImageryModalProps) {
  const [imagery, setImagery] = useState<ImageryResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !location) {
      setImagery(null)
      return
    }

    const fetchImagery = async () => {
      setLoading(true)
      try {
        const currentDate = date || new Date().toISOString().split("T")[0]
        const query = new URLSearchParams({
          lat: location.lat.toString(),
          lon: location.lon.toString(),
          date: currentDate,
        })

        const res = await fetch(`/api/satellite?${query.toString()}`)
        const data: ImageryResponse = await res.json()
        if (data.error) throw new Error(data.error)

        setImagery(data)
      } catch (err) {
        console.error("Error fetching imagery:", err)
        setImagery(null)
      } finally {
        setLoading(false)
      }
    }

    fetchImagery()
  }, [open, location, date])

  if (!location) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-foreground">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Satellite className="w-6 h-6 text-primary" />
            </div>
            Satellite Imagery
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Earthdata snapshot imagery
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="gap-2 px-3 py-1.5 text-sm">
              <MapPin className="w-4 h-4" />
              {location.name}
            </Badge>
            <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
              <Calendar className="w-4 h-4" />
              {imagery?.metadata.date || date || "Latest"}
            </Badge>
            {imagery && (
              <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
                <Satellite className="w-4 h-4" />
                {imagery.metadata.satellite}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96 bg-muted/30 rounded-xl border-2 border-dashed border-border">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">Loading satellite imagery...</p>
              </div>
            </div>
          ) : imagery ? (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-muted-foreground">True Color Imagery</div>
              <div className="relative rounded-xl overflow-hidden border-2 border-border shadow-2xl group">
                <img
                  src={imagery.trueColor}
                  alt="True Color"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-muted/30 rounded-xl border-2 border-dashed border-border">
              <p className="text-muted-foreground">Failed to load imagery</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
