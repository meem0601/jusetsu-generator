import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { JusetsuData } from "@/types/jusetsu";

// pdf-lib doesn't have native Japanese font support, so we'll embed a font
// For MVP, we use a simple approach with ASCII + basic layout
// For production, you'd embed a Japanese font file

export async function POST(request: NextRequest) {
  try {
    const data: JusetsuData = await request.json();

    // Load Japanese font from reliable CDN
    const fontUrl = "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf";
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) throw new Error("Failed to load font");
    const fontBytes = await fontRes.arrayBuffer();

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(fontBytes);
    const boldFont = font; // Variable font, same file

    const pageWidth = 595.28; // A4
    const pageHeight = 841.89;
    const margin = 50;
    const lineHeight = 18;
    const sectionGap = 12;
    let currentY = pageHeight - margin;
    let page = pdfDoc.addPage([pageWidth, pageHeight]);

    function ensureSpace(needed: number) {
      if (currentY - needed < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }
    }

    function drawTitle(text: string) {
      ensureSpace(40);
      page.drawText(text, {
        x: margin,
        y: currentY,
        size: 18,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 30;
      // underline
      page.drawLine({
        start: { x: margin, y: currentY + 5 },
        end: { x: pageWidth - margin, y: currentY + 5 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      currentY -= 10;
    }

    function drawSection(title: string) {
      ensureSpace(30);
      currentY -= sectionGap;
      page.drawRectangle({
        x: margin,
        y: currentY - 4,
        width: pageWidth - margin * 2,
        height: 22,
        color: rgb(0.93, 0.93, 0.97),
      });
      page.drawText(title, {
        x: margin + 8,
        y: currentY,
        size: 11,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.3),
      });
      currentY -= lineHeight + 4;
    }

    function drawField(label: string, value: string) {
      ensureSpace(lineHeight + 4);
      page.drawText(`${label}：`, {
        x: margin + 10,
        y: currentY,
        size: 9,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });

      // Wrap long text
      const maxWidth = pageWidth - margin * 2 - 120;
      const displayValue = value || "—";
      const lines = wrapText(displayValue, font, 9, maxWidth);

      lines.forEach((line, i) => {
        if (i > 0) {
          currentY -= lineHeight;
          ensureSpace(lineHeight);
        }
        page.drawText(line, {
          x: margin + 120,
          y: currentY,
          size: 9,
          font: font,
          color: rgb(0, 0, 0),
        });
      });
      currentY -= lineHeight;
    }

    function wrapText(text: string, f: typeof font, size: number, maxWidth: number): string[] {
      const lines: string[] = [];
      // Split by newlines first
      const paragraphs = text.split("\n");
      for (const para of paragraphs) {
        if (!para) { lines.push(""); continue; }
        let current = "";
        for (const char of para) {
          const test = current + char;
          try {
            const w = f.widthOfTextAtSize(test, size);
            if (w > maxWidth && current) {
              lines.push(current);
              current = char;
            } else {
              current = test;
            }
          } catch {
            current = test;
          }
        }
        if (current) lines.push(current);
      }
      return lines.length ? lines : [""];
    }

    // === Document Content ===
    drawTitle("重要事項説明書");

    // Add date
    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    page.drawText(dateStr, {
      x: pageWidth - margin - 120,
      y: currentY + 5,
      size: 9,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
    currentY -= 5;

    drawSection("物件の表示");
    drawField("名称", data.propertyName);
    drawField("所在地", data.address);
    drawField("部屋番号", data.roomNumber);
    drawField("間取り", data.layout);
    drawField("構造", data.structure);
    drawField("専有面積", data.area);
    drawField("築年月", data.builtDate);
    drawField("階建て", data.stories);
    drawField("所在階", data.floor);

    drawSection("登記簿に記載された事項");
    drawField("所有者（甲区）", data.owner);
    drawField("抵当権等（乙区）", data.mortgage);

    drawSection("法令上の制限");
    drawField("用途地域", data.zoning);

    drawSection("インフラ");
    drawField("飲用水", data.water);
    drawField("電気", data.electricity);
    drawField("ガス", data.gas);
    drawField("排水", data.drainage);

    drawSection("設備");
    drawField("台所", data.kitchen);
    drawField("浴室", data.bathroom);
    drawField("トイレ", data.toilet);
    drawField("エアコン", data.aircon);
    drawField("その他", data.otherEquipment);

    drawSection("借主情報");
    drawField("借主氏名", data.tenantName);
    drawField("借主住所", data.tenantAddress);

    drawSection("賃料等");
    drawField("賃料", data.rent);
    drawField("管理費・共益費", data.managementFee);
    drawField("敷金", data.deposit);
    drawField("礼金", data.keyMoney);
    drawField("その他費用", data.otherFees);

    drawSection("支払い方法");
    drawField("支払期限", data.paymentDeadline);
    drawField("支払方法", data.paymentMethod);

    drawSection("契約期間");
    drawField("開始日", data.contractStart);
    drawField("終了日", data.contractEnd);
    drawField("更新条件", data.renewalCondition);

    drawSection("ハザードマップ情報");
    drawField("洪水", data.floodRisk);
    drawField("土砂災害", data.landslideRisk);
    drawField("津波", data.tsunamiRisk);

    drawSection("耐震診断・石綿使用調査");
    drawField("耐震診断", data.earthquakeResistance);
    drawField("石綿使用調査", data.asbestos);

    drawSection("契約解除・違約金");
    drawField("解約条件", data.cancellationTerms);
    drawField("違約金", data.penalty);

    drawSection("特約事項");
    drawField("短期解約違約金", data.earlyTerminationPenalty);
    drawField("クリーニング代", data.cleaningFee);
    drawField("鍵交換費用", data.keyChangeFee);
    drawField("解約予告期間", data.noticePeriod);
    drawField("日割り計算", data.rentProrationOnCancel);
    drawField("ペット可否", data.petPolicy);
    drawField("楽器可否", data.instrumentPolicy);
    drawField("原状回復条件", data.restorationObligation);
    drawField("火災保険", data.insuranceRequirement);
    drawField("連帯保証人", data.guarantorInfo);
    drawField("駐車場・駐輪場", data.parking);
    drawField("ネット環境", data.internet);
    drawField("禁止事項", data.prohibitedItems);
    drawField("貸与鍵", data.keyCount);
    drawField("更新手続き", data.renewalProcedure);
    drawField("その他特約", data.otherSpecialTerms);

    drawSection("管理・貸主");
    drawField("管理会社", data.managementCompany);
    drawField("貸主", data.landlordName);

    drawSection("仲介業者");
    drawField("仲介業者名", data.brokerName);
    drawField("免許番号", data.brokerLicense);
    drawField("取引士", data.tradingOfficerName);

    // Footer on last page
    currentY -= 30;
    ensureSpace(60);
    page.drawLine({
      start: { x: margin, y: currentY },
      end: { x: pageWidth - margin, y: currentY },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5),
    });
    currentY -= 15;
    page.drawText(
      "上記の内容について、宅地建物取引士より説明を受け、理解しました。",
      { x: margin, y: currentY, size: 9, font: font, color: rgb(0, 0, 0) }
    );
    currentY -= 30;
    page.drawText("説明日：　　　年　　月　　日", {
      x: margin,
      y: currentY,
      size: 9,
      font: font,
      color: rgb(0, 0, 0),
    });
    currentY -= 20;
    page.drawText("買主（借主）：＿＿＿＿＿＿＿＿＿＿＿＿＿　印", {
      x: margin,
      y: currentY,
      size: 9,
      font: font,
      color: rgb(0, 0, 0),
    });
    currentY -= 20;
    page.drawText("宅地建物取引士：＿＿＿＿＿＿＿＿＿＿＿　印", {
      x: margin,
      y: currentY,
      size: 9,
      font: font,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="jusetsu.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PDF生成に失敗しました" },
      { status: 500 }
    );
  }
}
