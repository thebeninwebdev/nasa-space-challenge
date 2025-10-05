// app/api/satellite/route.ts

import { NextResponse } from "next/server"
import { buildSnapshotUrl } from "@/lib/earthdata-snapshot"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const lat = parseFloat(searchParams.get("lat") || "")
  const lon = parseFloat(searchParams.get("lon") || "")
  const date = searchParams.get("date") || ""
  const view = searchParams.get("view") || "true-color" // e.g. "true-color" | "false-color" | "ndvi"

  if (isNaN(lat) || isNaN(lon) || !date) {
    return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 })
  }

  // Build the three snapshot URLs (or just one depending on view)
  try {
    const spanDeg = 0.5 // or derive from zoom
    const width = 800
    const height = 600

    // You can build all views and return them; the client picks which to show
    const trueColor = buildSnapshotUrl({ lat, lon, date, spanDeg, width, height, layer: "MODIS_Terra_CorrectedReflectance_TrueColor" })
    const falseColor = buildSnapshotUrl({ lat, lon, date, spanDeg, width, height, layer: "MODIS_Terra_CorrectedReflectance_7-2-1" })  // example
    const ndvi = buildSnapshotUrl({ lat, lon, date, spanDeg, width, height, layer: "MODIS_Terra_NDVI" })

    return NextResponse.json({
      trueColor,
      falseColor,
      ndvi,
      metadata: {
        date,
        satellite: "MODIS",
        // cloud coverage you might set null or dummy, since snapshot API doesn't give that
      },
    })
  } catch (err: any) {
    console.error("Error in snapshot route:", err)
    return NextResponse.json({ error: "Failed to build imagery URLs" }, { status: 500 })
  }
}
