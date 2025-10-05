import { type NextRequest, NextResponse } from "next/server"
import { fetchNDVIData } from "@/lib/nasa-api"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = Number.parseFloat(searchParams.get("lat") || "0")
  const lon = Number.parseFloat(searchParams.get("lon") || "0")
  const startDate =
    searchParams.get("startDate") || new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const endDate = searchParams.get("endDate") || new Date().toISOString().split("T")[0]

  try {
    const data = await fetchNDVIData(lat, lon, startDate, endDate)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch NDVI data" }, { status: 500 })
  }
}
