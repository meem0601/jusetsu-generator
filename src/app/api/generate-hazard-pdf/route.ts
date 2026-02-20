import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export const maxDuration = 30;

interface HazardPdfRequest {
  address: string;
  floodMapImage: string;
  landslideMapImage: string;
  tsunamiMapImage: string;
  floodRisk: string;
  landslideRisk: string;
  tsunamiRisk: string;
}


const LEGENDS = {
  flood: [
    { color: [255, 255, 179] as const, label: "0.5m未満" },
    { color: [253, 174, 97] as const, label: "0.5〜3.0m" },
    { color: [215, 25, 28] as const, label: "3.0〜5.0m" },
    { color: [145, 0, 63] as const, label: "5.0〜10.0m" },
    { color: [117, 0, 130] as const, label: "10.0m以上" },
  ],
  landslide: [
    { color: [255, 255, 0] as const, label: "土砂災害警戒区域" },
    { color: [255, 0, 0] as const, label: "土砂災害特別警戒区域" },
  ],
  tsunami: [
    { color: [255, 255, 179] as const, label: "0.3m未満" },
    { color: [253, 174, 97] as const, label: "0.3〜1.0m" },
    { color: [215, 25, 28] as const, label: "1.0〜2.0m" },
    { color: [145, 0, 63] as const, label: "2.0〜5.0m" },
    { color: [117, 0, 130] as const, label: "5.0m以上" },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const data: HazardPdfRequest = await request.json();

    const fontUrl =
      "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf";
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) throw new Error("Failed to load font");
    const fontBytes = await fontRes.arrayBuffer();

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(fontBytes);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;
    let currentY = pageHeight - margin;
    let page = pdfDoc.addPage([pageWidth, pageHeight]);

    function ensureSpace(needed: number) {
      if (currentY - needed < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }
    }

    // Title
    page.drawText("ハザードマップ", {
      x: margin,
      y: currentY,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });
    currentY -= 25;
    page.drawLine({
      start: { x: margin, y: currentY + 5 },
      end: { x: pageWidth - margin, y: currentY + 5 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    currentY -= 10;

    if (data.address) {
      page.drawText(`対象物件: ${data.address}`, {
        x: margin,
        y: currentY,
        size: 9,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      currentY -= 20;
    }

    const maps = [
      { title: "洪水浸水想定区域図", image: data.floodMapImage, text: data.floodRisk, legend: LEGENDS.flood },
      { title: "土砂災害警戒区域図", image: data.landslideMapImage, text: data.landslideRisk, legend: LEGENDS.landslide },
      { title: "津波浸水想定区域図", image: data.tsunamiMapImage, text: data.tsunamiRisk, legend: LEGENDS.tsunami },
    ];

    const imgDisplayWidth = pageWidth - margin * 2 - 20;
    const imgDisplayHeight = imgDisplayWidth; // square 768x768

    for (const map of maps) {
      // Each map on new page (except first if space)
      ensureSpace(imgDisplayHeight + 100);

      // Section title
      page.drawRectangle({
        x: margin,
        y: currentY - 4,
        width: pageWidth - margin * 2,
        height: 22,
        color: rgb(0.93, 0.93, 0.97),
      });
      page.drawText(map.title, {
        x: margin + 8,
        y: currentY,
        size: 11,
        font,
        color: rgb(0.1, 0.1, 0.3),
      });
      currentY -= 25;

      if (map.image) {
        const imgBytes = Buffer.from(map.image, "base64");
        const img = await pdfDoc.embedPng(imgBytes);
        const scale = imgDisplayWidth / img.width;
        const h = img.height * scale;

        ensureSpace(h + 10);
        page.drawImage(img, {
          x: margin + 10,
          y: currentY - h,
          width: imgDisplayWidth,
          height: h,
        });
        currentY -= h + 10;
      } else {
        page.drawText("（画像を取得できませんでした）", {
          x: margin + 10,
          y: currentY,
          size: 9,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
        currentY -= 15;
      }

      // Risk text
      if (map.text) {
        ensureSpace(20);
        page.drawText(map.text, {
          x: margin + 10,
          y: currentY,
          size: 8,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        currentY -= 15;
      }

      // Legend
      ensureSpace(20 + map.legend.length * 16);
      page.drawText("【凡例】", {
        x: margin + 10,
        y: currentY,
        size: 8,
        font,
        color: rgb(0, 0, 0),
      });
      currentY -= 14;

      for (const item of map.legend) {
        ensureSpace(16);
        page.drawRectangle({
          x: margin + 15,
          y: currentY - 2,
          width: 14,
          height: 10,
          color: rgb(item.color[0] / 255, item.color[1] / 255, item.color[2] / 255),
          borderColor: rgb(0.5, 0.5, 0.5),
          borderWidth: 0.5,
        });
        page.drawText(item.label, {
          x: margin + 35,
          y: currentY,
          size: 8,
          font,
          color: rgb(0, 0, 0),
        });
        currentY -= 14;
      }

      currentY -= 15;
    }

    // Footer
    ensureSpace(30);
    page.drawText("※ 国土地理院・重ねるハザードマップのデータを元に作成", {
      x: margin,
      y: currentY,
      size: 7,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="hazard-map.pdf"',
      },
    });
  } catch (error) {
    console.error("Hazard PDF error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ハザードマップPDF生成に失敗しました" },
      { status: 500 },
    );
  }
}
