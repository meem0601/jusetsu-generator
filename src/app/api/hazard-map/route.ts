import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const maxDuration = 30;

type HazardType = "flood" | "landslide" | "tsunami";

const OVERLAY_URLS: Record<HazardType, string> = {
  flood: "https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data",
  landslide: "https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki",
  tsunami: "https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data",
};

const BASE_URL = "https://cyberjapandata.gsi.go.jp/xyz/pale";
const TILE_SIZE = 256;
const GRID = 3;
const TOTAL_SIZE = TILE_SIZE * GRID; // 768
const ZOOM = 15;

function latLonToTile(lat: number, lon: number, zoom: number) {
  const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const y = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
  return { x, y };
}

// Calculate pixel position of lat/lon within the 3x3 grid
function latLonToPixel(lat: number, lon: number, zoom: number, centerTileX: number, centerTileY: number) {
  const n = Math.pow(2, zoom);
  const pixelX = ((lon + 180) / 360) * n * TILE_SIZE - (centerTileX - 1) * TILE_SIZE;
  const latRad = (lat * Math.PI) / 180;
  const pixelY =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n * TILE_SIZE -
    (centerTileY - 1) * TILE_SIZE;
  return { x: Math.round(pixelX), y: Math.round(pixelY) };
}

async function fetchTile(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

// Transparent 256x256 PNG
function transparentTile(): Buffer {
  // 1x1 transparent PNG scaled isn't needed; sharp can handle null composites
  // Return a minimal transparent buffer
  return Buffer.alloc(0);
}

function markerSvg(cx: number, cy: number): Buffer {
  const svg = `<svg width="${TOTAL_SIZE}" height="${TOTAL_SIZE}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="8" fill="red" stroke="white" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="3" fill="white"/>
  </svg>`;
  return Buffer.from(svg);
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lon, type } = (await request.json()) as { lat: number; lon: number; type: HazardType };

    if (!lat || !lon || !type || !OVERLAY_URLS[type]) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const center = latLonToTile(lat, lon, ZOOM);

    // Fetch 3x3 base + overlay tiles
    const tilePromises: Promise<{ base: Buffer | null; overlay: Buffer | null; col: number; row: number }>[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const tx = center.x + dx;
        const ty = center.y + dy;
        const col = dx + 1;
        const row = dy + 1;
        tilePromises.push(
          Promise.all([
            fetchTile(`${BASE_URL}/${ZOOM}/${tx}/${ty}.png`),
            fetchTile(`${OVERLAY_URLS[type]}/${ZOOM}/${tx}/${ty}.png`),
          ]).then(([base, overlay]) => ({ base, overlay, col, row }))
        );
      }
    }

    const tiles = await Promise.all(tilePromises);

    // Build composite inputs
    const composites: sharp.OverlayOptions[] = [];
    for (const t of tiles) {
      if (t.base && t.base.length > 0) {
        composites.push({ input: t.base, left: t.col * TILE_SIZE, top: t.row * TILE_SIZE });
      }
      if (t.overlay && t.overlay.length > 0) {
        composites.push({ input: t.overlay, left: t.col * TILE_SIZE, top: t.row * TILE_SIZE });
      }
    }

    // Marker
    const pixel = latLonToPixel(lat, lon, ZOOM, center.x, center.y);
    composites.push({ input: markerSvg(pixel.x, pixel.y), left: 0, top: 0 });

    const image = await sharp({
      create: { width: TOTAL_SIZE, height: TOTAL_SIZE, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
    })
      .composite(composites)
      .png({ quality: 80 })
      .toBuffer();

    const base64 = image.toString("base64");
    return NextResponse.json({ image: base64 });
  } catch (error) {
    console.error("Hazard map error:", error);
    return NextResponse.json({ error: "Failed to generate hazard map" }, { status: 500 });
  }
}
