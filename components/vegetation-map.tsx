"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, ZoomIn, ZoomOut, Locate, Satellite } from "lucide-react"
import { MONITORING_LOCATIONS } from "@/lib/nasa-api"

interface VegetationMapProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void
  selectedLocation?: { lat: number; lon: number }
  onViewImagery?: () => void
}

export function VegetationMap({ onLocationSelect, selectedLocation, onViewImagery }: VegetationMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(3.2)
  const [offset, setOffset] = useState({ x: -1050, y: -535 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [pulsePhase, setPulsePhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 0.1) % (Math.PI * 2))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width)
    bgGradient.addColorStop(0, "#1a2332")
    bgGradient.addColorStop(1, "#0f1419")
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    const drawAfrica = () => {
      ctx.strokeStyle = "#3a4556"
      ctx.lineWidth = 2
      ctx.fillStyle = "#1e2936"

      const africaCoords = [
        [37, 32],
        [32, 31],
        [25, 31],
        [11, 33],
        [-6, 36],
        [-17, 28],
        [-17, 21],
        [-16, 16],
        [-17, 14],
        [-16, 12],
        [-5, 5],
        [10, 5],
        [15, 11],
        [23, 15],
        [33, 10],
        [42, 3],
        [48, -1],
        [51, -10],
        [41, -15],
        [40, -25],
        [35, -29],
        [32, -26],
        [29, -29],
        [25, -34],
        [18, -35],
        [17, -29],
        [12, -18],
        [10, -12],
        [15, -4],
        [18, 8],
        [25, 10],
        [30, 20],
        [37, 32],
      ]

      ctx.beginPath()
      africaCoords.forEach(([lon, lat], i) => {
        const x = ((lon + 180) / 360) * width * zoom + offset.x
        const y = ((90 - lat) / 180) * height * zoom + offset.y
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.strokeStyle = "#2a3544"
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.3

      for (let i = 0; i < africaCoords.length - 1; i++) {
        const [lon1, lat1] = africaCoords[i]
        const [lon2, lat2] = africaCoords[i + 1]

for (let offsetIndex = 5; offsetIndex < 20; offsetIndex += 5) {
  ctx.beginPath()
  const x1 = ((lon1 + 180) / 360) * width * zoom + offset.x
  const y1 = ((90 - lat1) / 180) * height * zoom + offset.y
  const x2 = ((lon2 + 180) / 360) * width * zoom + offset.x
  const y2 = ((90 - lat2) / 180) * height * zoom + offset.y

  const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2
  const offsetX = Math.cos(angle) * offsetIndex
  const offsetY = Math.sin(angle) * offsetIndex

  ctx.moveTo(x1 + offsetX, y1 + offsetY)
  ctx.lineTo(x2 + offsetX, y2 + offsetY)
  ctx.stroke()
}
      }
      ctx.globalAlpha = 1
    }

    drawAfrica()

    const drawVegetationZones = () => {
      const saharaGradient = ctx.createRadialGradient(
        ((18 + 180) / 360) * width * zoom + offset.x,
        ((90 - 23) / 180) * height * zoom + offset.y,
        50,
        ((18 + 180) / 360) * width * zoom + offset.x,
        ((90 - 23) / 180) * height * zoom + offset.y,
        200,
      )
      saharaGradient.addColorStop(0, "rgba(210, 180, 140, 0.2)")
      saharaGradient.addColorStop(1, "rgba(210, 180, 140, 0)")
      ctx.fillStyle = saharaGradient
      ctx.fillRect(0, 0, width, height)

      const congoGradient = ctx.createRadialGradient(
        ((23 + 180) / 360) * width * zoom + offset.x,
        ((90 - 0) / 180) * height * zoom + offset.y,
        50,
        ((23 + 180) / 360) * width * zoom + offset.x,
        ((90 - 0) / 180) * height * zoom + offset.y,
        150,
      )
      congoGradient.addColorStop(0, "rgba(34, 139, 34, 0.3)")
      congoGradient.addColorStop(1, "rgba(34, 139, 34, 0)")
      ctx.fillStyle = congoGradient
      ctx.fillRect(0, 0, width, height)
    }

    drawVegetationZones()

    MONITORING_LOCATIONS.forEach((location) => {
      const x = ((location.lon + 180) / 360) * width * zoom + offset.x
      const y = ((90 - location.lat) / 180) * height * zoom + offset.y

      const isSelected =
        selectedLocation &&
        Math.abs(selectedLocation.lat - location.lat) < 0.1 &&
        Math.abs(selectedLocation.lon - location.lon) < 0.1

      const pulseSize = 8 + Math.sin(pulsePhase) * 3
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 3)
      glowGradient.addColorStop(0, isSelected ? "rgba(125, 211, 252, 0.6)" : "rgba(251, 191, 36, 0.4)")
      glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = glowGradient
      ctx.fillRect(x - pulseSize * 3, y - pulseSize * 3, pulseSize * 6, pulseSize * 6)

      const markerGradient = ctx.createRadialGradient(x, y - 2, 0, x, y, isSelected ? 14 : 10)
      markerGradient.addColorStop(0, isSelected ? "#7dd3fc" : "#fbbf24")
      markerGradient.addColorStop(1, isSelected ? "#0ea5e9" : "#f59e0b")

      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 12 : 8, 0, Math.PI * 2)
      ctx.fillStyle = markerGradient
      ctx.fill()

      ctx.strokeStyle = isSelected ? "#e0f2fe" : "#fef3c7"
      ctx.lineWidth = 2
      ctx.stroke()

      if (isSelected) {
        for (let i = 1; i <= 2; i++) {
          ctx.beginPath()
          ctx.arc(x, y, 20 + i * 10 + Math.sin(pulsePhase + i) * 5, 0, Math.PI * 2)
          ctx.strokeStyle = "#7dd3fc"
          ctx.lineWidth = 2
          ctx.globalAlpha = 0.3 - i * 0.1
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(x - 40, y - 32, 80, 18)

      ctx.fillStyle = isSelected ? "#7dd3fc" : "#fbbf24"
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(location.name, x, y - 20)
    })

    ctx.strokeStyle = "#2a3544"
    ctx.lineWidth = 0.5
    ctx.globalAlpha = 0.4

    for (let lat = -40; lat <= 40; lat += 10) {
      ctx.beginPath()
      const y = ((90 - lat) / 180) * height * zoom + offset.y
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()

      ctx.fillStyle = "#6b7280"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(`${lat}°`, width - 10, y - 5)
    }

    for (let lon = -20; lon <= 60; lon += 10) {
      ctx.beginPath()
      const x = ((lon + 180) / 360) * width * zoom + offset.x
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()

      ctx.fillStyle = "#6b7280"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${lon}°`, x, height - 10)
    }

    ctx.globalAlpha = 1
  }, [zoom, offset, selectedLocation, pulsePhase])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    for (const location of MONITORING_LOCATIONS) {
      const locX = ((location.lon + 180) / 360) * canvas.offsetWidth * zoom + offset.x
      const locY = ((90 - location.lat) / 180) * canvas.offsetHeight * zoom + offset.y

      const distance = Math.sqrt((x - locX) ** 2 + (y - locY) ** 2)
      if (distance < 15) {
        onLocationSelect(location.lat, location.lon, location.name)
        setTimeout(() => {
          onViewImagery?.()
        }, 300)
        return
      }
    }

    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <Card className="relative overflow-hidden bg-card border-2 border-primary/20">
      <canvas
        ref={canvasRef}
        className="w-full h-[300px] sm:h-[400px] lg:h-[500px] cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom((z) => Math.min(z + 0.3, 5))}
          className="bg-card/80 backdrop-blur h-8 w-8 sm:h-10 sm:w-10"
        >
          <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom((z) => Math.max(z - 0.3, 1))}
          className="bg-card/80 backdrop-blur h-8 w-8 sm:h-10 sm:w-10"
        >
          <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => {
            setZoom(3.2)
            setOffset({ x: -1050, y: -535 })
          }}
          className="bg-card/80 backdrop-blur h-8 w-8 sm:h-10 sm:w-10"
        >
          <Locate className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
        {selectedLocation && onViewImagery && (
          <Button
            size="icon"
            variant="default"
            onClick={onViewImagery}
            className="bg-primary/90 backdrop-blur h-8 w-8 sm:h-10 sm:w-10 animate-pulse"
            title="View Satellite Imagery"
          >
            <Satellite className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        )}
      </div>

      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-primary/30">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
          <span className="hidden sm:inline">Click markers to explore African vegetation</span>
          <span className="sm:hidden">Tap markers</span>
        </div>
      </div>
    </Card>
  )
}
