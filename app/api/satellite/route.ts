import { NextResponse } from "next/server"
import { buildSnapshotUrl } from "@/lib/earthdata-snapshot"

// Check if the image at a URL is likely black or empty by using HEAD request
async function imageLikelyValid(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" })
    if (!res.ok) return false

    const contentLength = res.headers.get("content-length")
    if (contentLength && parseInt(contentLength) < 10000) {
      // image is too small to be real (likely empty or black)
      return false
    }

    return true
  } catch (err) {
    console.error("HEAD check failed:", err)
    return false
  }
}

// Helper to get date in YYYY-MM-DD format
function getDateOffset(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split("T")[0]
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const lat = parseFloat(searchParams.get("lat") || "")
  const lon = parseFloat(searchParams.get("lon") || "")
  const inputDate = searchParams.get("date") || ""
  const view = searchParams.get("view") || "true-color"

  if (isNaN(lat) || isNaN(lon) || !inputDate) {
    return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 })
  }

  const spanDeg = 0.5
  const width = 800
  const height = 600

  // Preferred layers
  const layers = {
    trueColor: "MODIS_Terra_CorrectedReflectance_TrueColor",
    falseColor: "MODIS_Terra_CorrectedReflectance_7-2-1",
    ndvi: "MODIS_Terra_NDVI",
  }

  // Fallback layers
  const fallbackTrueColorLayer = "MODIS_Aqua_CorrectedReflectance_TrueColor"

  try {
    // Build primary image URL
    const trueColorUrl = buildSnapshotUrl({
      lat,
      lon,
      date: inputDate,
      spanDeg,
      width,
      height,
      layer: layers.trueColor,
    })

    const isPrimaryValid = await imageLikelyValid(trueColorUrl)

    let finalUrl = trueColorUrl
    let finalDate = inputDate
    let satellite = "MODIS Terra"

    // Fallback to yesterday
    if (!isPrimaryValid) {
      const yesterday = getDateOffset(-1)
      const retryUrl = buildSnapshotUrl({
        lat,
        lon,
        date: yesterday,
        spanDeg,
        width,
        height,
        layer: layers.trueColor,
      })

      const isRetryValid = await imageLikelyValid(retryUrl)

      if (isRetryValid) {
        finalUrl = retryUrl
        finalDate = yesterday
      } else {
        // Try Aqua layer fallback for yesterday
        const aquaUrl = buildSnapshotUrl({
          lat,
          lon,
          date: yesterday,
          spanDeg,
          width,
          height,
          layer: fallbackTrueColorLayer,
        })

        const isAquaValid = await imageLikelyValid(aquaUrl)

        if (isAquaValid) {
          finalUrl = aquaUrl
          finalDate = yesterday
          satellite = "MODIS Aqua"
        } else {
          // Give up
          return NextResponse.json({ error: "No valid imagery found" }, { status: 404 })
        }
      }
    }

    // Other imagery types (false color, NDVI) — always return them, no checks for simplicity
    const falseColor = buildSnapshotUrl({
      lat,
      lon,
      date: finalDate,
      spanDeg,
      width,
      height,
      layer: layers.falseColor,
    })

    const ndvi = buildSnapshotUrl({
      lat,
      lon,
      date: finalDate,
      spanDeg,
      width,
      height,
      layer: layers.ndvi,
    })

    return NextResponse.json({
      trueColor: finalUrl,
      falseColor,
      ndvi,
      metadata: {
        date: finalDate,
        satellite,
      },
    })
  } catch (err: any) {
    console.error("Error in snapshot route:", err)
    return NextResponse.json({ error: "Failed to build imagery URLs" }, { status: 500 })
  }
}
