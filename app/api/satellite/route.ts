import { NextResponse } from "next/server"
import { buildSnapshotUrl } from "@/lib/earthdata-snapshot"


/**
 * Performs a lightweight HEAD check to determine if the image URL is likely valid.
 * Rejects very small files (likely empty/black imagery).
 */

async function imageLikelyValid(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" })
    if (!res.ok) return false

    const contentLengthHeader = res.headers.get("content-length")

    if (contentLengthHeader !== null) {
      const contentLength = parseInt(contentLengthHeader, 10)
      if (!isNaN(contentLength) && contentLength < 10000) {
        return false
      }
    }

    return true
  } catch (err) {
    console.error("HEAD check failed:", err)
    return false
  }
}


/** Returns date string offset by N days in YYYY-MM-DD format */
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

  const layers = {
    trueColor: "MODIS_Terra_CorrectedReflectance_TrueColor",
    falseColor: "MODIS_Terra_CorrectedReflectance_7-2-1",
    ndvi: "MODIS_Terra_NDVI",
  }

  const fallbackLayer = "MODIS_Aqua_CorrectedReflectance_TrueColor"

  try {
    // Step 1: Try Terra (input date)
    const primaryUrl = buildSnapshotUrl({
      lat, lon, date: inputDate, spanDeg, width, height, layer: layers.trueColor,
    })

    if (await imageLikelyValid(primaryUrl)) {
      return successResponse(primaryUrl, inputDate, "MODIS Terra", lat, lon, spanDeg, width, height, layers)
    }

    // Step 2: Try Terra (yesterday)
    const yesterday = getDateOffset(-1)
    const yesterdayTerraUrl = buildSnapshotUrl({
      lat, lon, date: yesterday, spanDeg, width, height, layer: layers.trueColor,
    })

    if (await imageLikelyValid(yesterdayTerraUrl)) {
      return successResponse(yesterdayTerraUrl, yesterday, "MODIS Terra", lat, lon, spanDeg, width, height, layers)
    }

    // Step 3: Try Aqua (yesterday)
    const aquaUrl = buildSnapshotUrl({
      lat, lon, date: yesterday, spanDeg, width, height, layer: fallbackLayer,
    })

    if (await imageLikelyValid(aquaUrl)) {
      return successResponse(aquaUrl, yesterday, "MODIS Aqua", lat, lon, spanDeg, width, height, layers)
    }

    // All attempts failed
    return NextResponse.json({ error: "No valid imagery found" }, { status: 404 })

  } catch (err) {
    console.error("Error in satellite API:", err)
    return NextResponse.json({ error: "Failed to build imagery URLs" }, { status: 500 })
  }
}

/** Constructs a full response payload with all imagery layers */
function successResponse(
  trueColorUrl: string,
  date: string,
  satellite: string,
  lat: number,
  lon: number,
  spanDeg: number,
  width: number,
  height: number,
  layers: { trueColor: string; falseColor: string; ndvi: string }
) {
  const falseColor = buildSnapshotUrl({
    lat, lon, date, spanDeg, width, height, layer: layers.falseColor,
  })

  const ndvi = buildSnapshotUrl({
    lat, lon, date, spanDeg, width, height, layer: layers.ndvi,
  })

  return NextResponse.json({
    trueColor: trueColorUrl,
    falseColor,
    ndvi,
    metadata: {
      date,
      satellite,
    },
  })
}
