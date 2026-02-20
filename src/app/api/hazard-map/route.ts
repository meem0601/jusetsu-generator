import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`
    );
    const data = await res.json();
    if (!data || data.length === 0) return null;
    const [lon, lat] = data[0].geometry.coordinates;
    return { lat, lon };
  } catch {
    return null;
  }
}

async function captureHazardMap(
  lat: number,
  lon: number,
  type: "flood" | "landslide" | "tsunami"
): Promise<string> {
  // Build disaportal URL with appropriate layers
  // Base: pale map, no extra layers visible by default
  // flood: shinsuishin (洪水浸水想定区域) - layer flood_l2_shinsuishin
  // landslide: dosya (土砂災害) - layer dosyasyamen_kokuji + keikaikuiki  
  // tsunami: tsunami_newlegend_l2
  
  let url = `https://disaportal.gsi.go.jp/maps/index.html?ll=${lat},${lon}&z=15&base=pale&vs=c1j0l0u0t0h0z0`;
  
  // Add layer params based on type
  switch (type) {
    case "flood":
      url += "&ls=flood_l2_shinsuishin";
      break;
    case "landslide":
      url += "&ls=dosyasyamen_kokuji%2Cdosyakeikaikuiki";
      break;
    case "tsunami":
      url += "&ls=tsunami_newlegend_l2";
      break;
  }

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 768, height: 768 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    
    // Navigate and wait for map tiles to load
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    
    // Wait extra for tile rendering
    await new Promise((r) => setTimeout(r, 3000));
    
    // Hide UI elements that obscure the map
    await page.evaluate(() => {
      // Hide search bar, sidebar, controls etc
      const selectors = [
        '.header_area', '.search_area', '.sidebar', '.leaflet-control-container',
        '#header', '#sidebar', '.ol-control', '.ol-overlaycontainer-stopevent',
        '.map-btn-area', '#menu', '.legend_area', '#search_area',
        '.ol-attribution', '.ol-zoom', '#legend_area',
      ];
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
      });
    });

    const screenshot = await page.screenshot({
      type: "png",
      encoding: "base64",
    });

    return screenshot as string;
  } finally {
    await browser.close();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, lat: providedLat, lon: providedLon } = body;

    let lat = providedLat;
    let lon = providedLon;

    // Geocode if coordinates not provided
    if ((!lat || !lon) && address) {
      const coords = await geocodeAddress(address);
      if (!coords) {
        return NextResponse.json({ error: "住所から座標を取得できませんでした" }, { status: 400 });
      }
      lat = coords.lat;
      lon = coords.lon;
    }

    if (!lat || !lon) {
      return NextResponse.json({ error: "住所または座標が必要です" }, { status: 400 });
    }

    // Capture all 3 hazard maps in sequence (parallel would need too much memory)
    const types = ["flood", "landslide", "tsunami"] as const;
    const results: Record<string, string> = {};

    for (const type of types) {
      try {
        results[`${type}MapImage`] = await captureHazardMap(lat, lon, type);
      } catch (e) {
        console.error(`Failed to capture ${type} map:`, e);
        results[`${type}MapImage`] = "";
      }
    }

    return NextResponse.json({
      floodMapImage: results.floodMapImage || "",
      landslideMapImage: results.landslideMapImage || "",
      tsunamiMapImage: results.tsunamiMapImage || "",
      lat,
      lon,
    });
  } catch (error) {
    console.error("Hazard map error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ハザードマップの取得に失敗しました" },
      { status: 500 }
    );
  }
}
