import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PDFPage, PDFFont, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { JusetsuData } from "@/types/jusetsu";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import {
  PAGE1,
  PAGE3,
  PAGE4,
  PAGE5,
  PAGE6,
  PAGE7,
  PAGE8,
  FieldCoord,
} from "@/lib/template-coordinates";

export const maxDuration = 60;

const WHITE = rgb(1, 1, 1);
const BLACK = rgb(0, 0, 0);

// Clear existing text with white rectangle, then write new text
function clearAndWrite(
  page: PDFPage,
  font: PDFFont,
  coord: FieldCoord,
  text: string,
  opts?: { noWhite?: boolean }
) {
  if (!text) return;
  const size = coord.fontSize || 8;

  if (!opts?.noWhite) {
    // White rectangle to cover existing text - very generous to cover all old template data
    const clearH = Math.max(coord.h || 14, size + 6) + 10;
    // Extend 10pt to the left and add 20pt total width padding to catch wider old text
    const clearX = Math.max(coord.x - 10, 0);
    const clearW = coord.w + 20 + (coord.x - clearX);
    page.drawRectangle({
      x: clearX,
      y: coord.y - 6,
      width: Math.min(clearW, 580 - clearX), // Don't exceed page width
      height: clearH,
      color: WHITE,
    });
  }

  // Handle multi-line text if it exceeds maxWidth
  if (coord.maxWidth) {
    const lines = wrapText(font, text, size, coord.maxWidth);
    let yOffset = 0;
    for (const line of lines) {
      page.drawText(line, {
        x: coord.x,
        y: coord.y - yOffset,
        size,
        font,
        color: BLACK,
      });
      yOffset += size + 2;
    }
  } else {
    // Auto-shrink if text is too wide
    let finalSize = size;
    while (finalSize > 4) {
      const w = font.widthOfTextAtSize(text, finalSize);
      if (w <= coord.w) break;
      finalSize -= 0.5;
    }
    page.drawText(text, {
      x: coord.x,
      y: coord.y,
      size: finalSize,
      font,
      color: BLACK,
    });
  }
}

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const char of text) {
    const test = current + char;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      if (current) lines.push(current);
      current = char;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Draw a checkmark using line drawing (cross-platform safe)
function drawCheck(page: PDFPage, _font: PDFFont, coord: FieldCoord) {
  const size = coord.fontSize || 10;
  const cx = coord.x + 2;
  const cy = coord.y + 2;
  // Draw a simple "✓" shape with lines
  page.drawLine({
    start: { x: cx, y: cy + size * 0.3 },
    end: { x: cx + size * 0.3, y: cy },
    thickness: 1.5,
    color: BLACK,
  });
  page.drawLine({
    start: { x: cx + size * 0.3, y: cy },
    end: { x: cx + size * 0.8, y: cy + size * 0.7 },
    thickness: 1.5,
    color: BLACK,
  });
}

// Draw multiline text in a box area
function drawMultilineText(
  page: PDFPage,
  font: PDFFont,
  coord: FieldCoord,
  text: string
) {
  if (!text) return;
  const size = coord.fontSize || 8;
  const lineHeight = size + 2;
  const maxLines = Math.floor(coord.h / lineHeight);

  // Clear area
  page.drawRectangle({
    x: coord.x - 1,
    y: coord.y - coord.h - 1,
    width: coord.w + 2,
    height: coord.h + 2,
    color: WHITE,
  });

  const lines = wrapText(font, text, size, coord.w);
  for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
    page.drawText(lines[i], {
      x: coord.x,
      y: coord.y - i * lineHeight,
      size,
      font,
      color: BLACK,
    });
  }
}

function formatCurrency(amount: number): string {
  if (!amount) return "";
  return amount.toLocaleString() + "円";
}

// Clear a horizontal band across the content area of a page
// Used to wipe template sample data before writing new values
function clearBand(page: PDFPage, y: number, height: number, xStart = 55, xEnd = 575) {
  page.drawRectangle({
    x: xStart,
    y: y - 2,
    width: xEnd - xStart,
    height: height + 4,
    color: WHITE,
  });
}

export async function POST(request: NextRequest) {
  try {
    const data: JusetsuData = await request.json();

    // Load template PDF - try local file first, then fetch from public URL
    let templateBytes: Buffer;
    const templatePath = join(process.cwd(), "public", "template.pdf");
    if (existsSync(templatePath)) {
      templateBytes = readFileSync(templatePath);
    } else {
      // Vercel: fetch from public URL
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
      const templateRes = await fetch(`${baseUrl}/template.pdf`);
      if (!templateRes.ok) throw new Error("テンプレートPDFの取得に失敗しました");
      templateBytes = Buffer.from(await templateRes.arrayBuffer());
    }
    const pdfDoc = await PDFDocument.load(templateBytes, { updateMetadata: false });

    // Embed Japanese font - try local file first, then fetch
    pdfDoc.registerFontkit(fontkit);
    let fontBytes: ArrayBuffer;
    const fontPath = join(process.cwd(), "public", "NotoSansJP-Regular.ttf");
    if (existsSync(fontPath)) {
      const buf = readFileSync(fontPath);
      fontBytes = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    } else {
      // Vercel: fetch from public URL or Google Fonts
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
      let fontRes = await fetch(`${baseUrl}/NotoSansJP-Regular.ttf`);
      if (!fontRes.ok) {
        fontRes = await fetch(
          "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf"
        );
      }
      fontBytes = await fontRes.arrayBuffer();
    }
    const font = await pdfDoc.embedFont(fontBytes);

    // === PAGE 1: Header, brokers, officers, guarantee association ===
    const page1 = pdfDoc.getPage(0);

    // Clear the borrower/lender name band (Y≈740, covers the "借主...様に対し、貸主...様" line)
    clearBand(page1, 734, 20, 100, 575);  // entire header line
    clearAndWrite(page1, font, PAGE1.borrowerName, data.borrowerName || "", { noWhite: true });
    clearAndWrite(page1, font, PAGE1.lenderName, data.lenderName || "", { noWhite: true });

    // Transaction type - already in template, skip unless non-default
    // Template has "媒介" pre-printed, so only draw if different
    if (data.transactionType === "代理") {
      drawCheck(page1, font, PAGE1.transactionTypeLeftAgent);
    }

    // Broker 1 (left) - MEEM fixed info already in template, DO NOT overwrite

    // Broker 2 (right) - only if has data (not in template)
    if (data.broker2?.companyName) {
      clearAndWrite(page1, font, PAGE1.broker2License, data.broker2.licenseNumber || "");
      clearAndWrite(page1, font, PAGE1.broker2Address, data.broker2.officeAddress || "");
      clearAndWrite(page1, font, PAGE1.broker2Phone, data.broker2.phone || "");
      clearAndWrite(page1, font, PAGE1.broker2Name, data.broker2.companyName || "");
      clearAndWrite(page1, font, PAGE1.broker2Rep, data.broker2.representative || "");
    }

    // Trading Officer 1 - MEEM fixed info already in template, DO NOT overwrite

    // Trading Officer 2 - only if has data (not in template)
    if (data.tradingOfficer2?.name) {
      clearAndWrite(page1, font, PAGE1.officer2RegNumber, data.tradingOfficer2.registrationNumber || "");
      clearAndWrite(page1, font, PAGE1.officer2Name, data.tradingOfficer2.name || "");
      clearAndWrite(page1, font, PAGE1.officer2OfficeName, data.tradingOfficer2.officeName || "");
      clearAndWrite(page1, font, PAGE1.officer2OfficeAddress, data.tradingOfficer2.officeAddress || "");
      clearAndWrite(page1, font, PAGE1.officer2Phone, data.tradingOfficer2.phone || "");
    }

    // Guarantee Association - MEEM fixed info already in template, DO NOT overwrite

    // === PAGE 2: Table of contents - skip (no editable fields) ===

    // === PAGE 3: Building, landlord, registry, legal, infrastructure ===
    const page3 = pdfDoc.getPage(2);

    // Clear entire building section (A) data area - rows at Y=772,750,728,706,684,662,640
    // Clear from value column start (x≈100) to right edge, leaving labels intact
    clearBand(page3, 636, 150, 100, 575);  // Building section A: covers Y 636-786

    // Clear landlord section (B) data area
    clearBand(page3, 550, 60, 100, 575);   // Landlord section: covers Y 550-610

    // Clear registry section (owner address/name + 甲区/乙区)
    clearBand(page3, 365, 155, 56, 575);  // Registry: covers Y 365-520, wider left margin

    // Clear legal restrictions value area
    clearBand(page3, 268, 30, 56, 575);    // Legal restrictions: covers Y 268-298

    // Building info
    clearAndWrite(page3, font, PAGE3.buildingName, data.building?.name || "", { noWhite: true });
    clearAndWrite(page3, font, PAGE3.addressDisplay, data.building?.addressDisplay || "", { noWhite: true });
    clearAndWrite(page3, font, PAGE3.addressRegistry, data.building?.addressRegistry || "", { noWhite: true });

    // Building type checkboxes
    const typeMap: Record<string, FieldCoord> = {
      "マンション": PAGE3.typeManshon,
      "アパート": PAGE3.typeApart,
      "戸建": PAGE3.typeKodate,
      "テラスハウス": PAGE3.typeTerrace,
    };
    const typeCoord = typeMap[data.building?.type || ""];
    if (typeCoord) drawCheck(page3, font, typeCoord);

    clearAndWrite(page3, font, PAGE3.structure, data.building?.structure || "", { noWhite: true });
    clearAndWrite(page3, font, PAGE3.floorArea, data.building?.floorArea || "", { noWhite: true });
    clearAndWrite(page3, font, PAGE3.layout, data.building?.layout || "", { noWhite: true });
    clearAndWrite(page3, font, PAGE3.builtDate, data.building?.builtDate || "", { noWhite: true });

    // Landlord
    if (data.landlord?.sameAsOwner) {
      drawCheck(page3, font, PAGE3.landlordSameCheck);
    } else {
      drawCheck(page3, font, PAGE3.landlordDiffCheck);
    }
    clearAndWrite(page3, font, PAGE3.landlordAddress, data.landlord?.address || "", { noWhite: true });
    clearAndWrite(page3, font, PAGE3.landlordName, data.landlord?.name || "", { noWhite: true });
    if (data.landlord?.remarks) {
      drawMultilineText(page3, font, PAGE3.landlordRemarks, data.landlord.remarks);
    }

    // Registry
    clearAndWrite(page3, font, PAGE3.ownerAddress, data.registry?.ownerAddress || "", { noWhite: true });
    clearAndWrite(page3, font, PAGE3.ownerName, data.registry?.ownerName || "", { noWhite: true });

    if (data.registry?.ownershipRights) {
      drawCheck(page3, font, PAGE3.ownershipYes);
      if (data.registry.ownershipRightsDetail) {
        drawMultilineText(page3, font, PAGE3.ownershipDetail, data.registry.ownershipRightsDetail);
      }
    } else {
      drawCheck(page3, font, PAGE3.ownershipNo);
    }

    if (data.registry?.otherRights) {
      drawCheck(page3, font, PAGE3.otherRightsYes);
      if (data.registry.otherRightsDetail) {
        drawMultilineText(page3, font, PAGE3.otherRightsDetail, data.registry.otherRightsDetail);
      }
    } else {
      drawCheck(page3, font, PAGE3.otherRightsNo);
    }

    // Legal restrictions
    if (data.legalRestrictions) {
      drawMultilineText(page3, font, PAGE3.legalRestrictions, data.legalRestrictions);
    }

    // Infrastructure - water
    if (data.infrastructure?.water?.available) {
      drawCheck(page3, font, PAGE3.waterAvailYes);
    } else {
      drawCheck(page3, font, PAGE3.waterAvailNo);
    }

    // Infrastructure - electricity
    if (data.infrastructure?.electricity?.available) {
      drawCheck(page3, font, PAGE3.electricAvailYes);
    } else {
      drawCheck(page3, font, PAGE3.electricAvailNo);
    }

    // === PAGE 4: Gas, drainage, equipment ===
    const page4 = pdfDoc.getPage(3);

    // Gas
    if (data.infrastructure?.gas?.available) {
      drawCheck(page4, font, PAGE4.gasAvailYes);
      if (data.infrastructure.gas.type) {
        clearAndWrite(page4, font, PAGE4.gasType, data.infrastructure.gas.type);
      }
    } else {
      drawCheck(page4, font, PAGE4.gasAvailNo);
    }

    // Drainage
    if (data.infrastructure?.drainage?.available) {
      drawCheck(page4, font, PAGE4.drainageAvailYes);
      if (data.infrastructure.drainage.type) {
        clearAndWrite(page4, font, PAGE4.drainageType, data.infrastructure.drainage.type);
      }
    } else {
      drawCheck(page4, font, PAGE4.drainageAvailNo);
    }

    // Equipment items - render checkboxes for each
    const equipmentItems = [
      "electricity", "gas", "stove", "waterSupply", "sewage", "kitchen",
      "toilet", "bathroom", "washstand", "laundry", "hotWater", "aircon",
      "lighting", "furniture", "digitalTV", "catv", "internet", "trunkRoom",
    ] as const;

    equipmentItems.forEach((key, i) => {
      const item = data.equipment?.[key];
      if (!item) return;
      const y = PAGE4.equipmentStartY - i * PAGE4.equipmentRowHeight;
      const coord: FieldCoord = { x: item.exists ? PAGE4.equipmentYesX : PAGE4.equipmentNoX, y, w: 12, h: 12, fontSize: 10 };
      drawCheck(page4, font, coord);
      if (item.detail) {
        clearAndWrite(page4, font, {
          x: PAGE4.equipmentDetailX, y, w: PAGE4.equipmentDetailW, h: 12, fontSize: 7,
        }, item.detail);
      }
    });

    // === PAGE 5: Common facilities, hazard zones, hazard map, asbestos, earthquake ===
    const page5 = pdfDoc.getPage(4);

    // Common facilities
    const commonItems = [
      "elevator", "autoLock", "mailbox", "deliveryBox", "trunkRoom",
      "parking", "bicycle", "bikeParking",
    ] as const;

    commonItems.forEach((key, i) => {
      const item = data.commonFacilities?.[key];
      if (!item) return;
      const y = PAGE5.commonFacilityStartY - i * PAGE5.commonFacilityRowHeight;
      const coord: FieldCoord = { x: item.exists ? PAGE5.commonYesX : PAGE5.commonNoX, y, w: 12, h: 12, fontSize: 10 };
      drawCheck(page5, font, coord);
      if (item.detail) {
        clearAndWrite(page5, font, {
          x: PAGE5.commonDetailX, y, w: PAGE5.commonDetailW, h: 12, fontSize: 7,
        }, item.detail);
      }
    });

    // Hazard zones
    if (!data.hazardZones?.developedLandDisasterZone) {
      drawCheck(page5, font, PAGE5.hazardZoneOutside);
    } else {
      drawCheck(page5, font, PAGE5.hazardZoneInside);
    }

    if (!data.hazardZones?.landslideWarningZone) {
      drawCheck(page5, font, PAGE5.landslideWarningOutside);
    } else {
      drawCheck(page5, font, PAGE5.landslideWarningInside);
    }
    if (!data.hazardZones?.landslideSpecialZone) {
      drawCheck(page5, font, PAGE5.landslideSpecialOutside);
    } else {
      drawCheck(page5, font, PAGE5.landslideSpecialInside);
    }

    if (!data.hazardZones?.tsunamiWarningZone) {
      drawCheck(page5, font, PAGE5.tsunamiWarningOutside);
    } else {
      drawCheck(page5, font, PAGE5.tsunamiWarningInside);
    }
    if (!data.hazardZones?.tsunamiSpecialZone) {
      drawCheck(page5, font, PAGE5.tsunamiSpecialOutside);
    } else {
      drawCheck(page5, font, PAGE5.tsunamiSpecialInside);
    }

    // Hazard map
    if (data.hazardMap?.floodExists) {
      drawCheck(page5, font, PAGE5.floodYes);
    } else {
      drawCheck(page5, font, PAGE5.floodNo);
    }
    if (data.hazardMap?.stormWaterExists) {
      drawCheck(page5, font, PAGE5.stormWaterYes);
    } else {
      drawCheck(page5, font, PAGE5.stormWaterNo);
    }
    if (data.hazardMap?.stormSurgeExists) {
      drawCheck(page5, font, PAGE5.stormSurgeYes);
    } else {
      drawCheck(page5, font, PAGE5.stormSurgeNo);
    }

    // Asbestos
    if (data.asbestos?.recordExists) {
      drawCheck(page5, font, PAGE5.asbestosRecordYes);
    } else {
      drawCheck(page5, font, PAGE5.asbestosRecordNo);
    }

    // Earthquake
    if (data.earthquake?.applicable) {
      drawCheck(page5, font, PAGE5.earthquakeApplicable);
    } else {
      drawCheck(page5, font, PAGE5.earthquakeNotApplicable);
    }

    // === PAGE 6: Financials, cancellation, penalty, security ===
    const page6 = pdfDoc.getPage(5);

    // Clear financial section data area (Y 465-680)
    clearBand(page6, 465, 220, 56, 575);
    // Clear penalty area (Y 120-145)
    clearBand(page6, 120, 30, 56, 575);

    if (data.financials?.rent) {
      clearAndWrite(page6, font, PAGE6.rent, formatCurrency(data.financials.rent));
    }
    if (data.financials?.managementFee) {
      clearAndWrite(page6, font, PAGE6.managementFee, formatCurrency(data.financials.managementFee));
    }
    if (data.financials?.deposit) {
      clearAndWrite(page6, font, PAGE6.deposit, formatCurrency(data.financials.deposit));
    }
    if (data.financials?.keyMoney) {
      clearAndWrite(page6, font, PAGE6.keyMoney, formatCurrency(data.financials.keyMoney));
    }

    // Other fees
    if (data.financials?.otherFees) {
      const feeCoords = [
        { name: PAGE6.otherFee1Name, amount: PAGE6.otherFee1Amount },
        { name: PAGE6.otherFee2Name, amount: PAGE6.otherFee2Amount },
        { name: PAGE6.otherFee3Name, amount: PAGE6.otherFee3Amount },
      ];
      data.financials.otherFees.forEach((fee, i) => {
        if (i < feeCoords.length && fee.name) {
          clearAndWrite(page6, font, feeCoords[i].name, fee.name);
          clearAndWrite(page6, font, feeCoords[i].amount, fee.amount || "");
        }
      });
    }

    if (data.financials?.paymentDeadline) {
      clearAndWrite(page6, font, PAGE6.paymentDeadline, data.financials.paymentDeadline);
    }
    if (data.financials?.paymentMethod) {
      clearAndWrite(page6, font, PAGE6.paymentMethod, data.financials.paymentMethod);
    }
    if (data.financials?.bankInfo) {
      clearAndWrite(page6, font, PAGE6.bankInfo, data.financials.bankInfo);
    }

    // Penalty
    if (data.penalty?.exists) {
      drawCheck(page6, font, PAGE6.penaltyYes);
      if (data.penalty.detail) {
        drawMultilineText(page6, font, PAGE6.penaltyDetail, data.penalty.detail);
      }
    } else {
      drawCheck(page6, font, PAGE6.penaltyNo);
    }

    // Security measure
    if (data.securityMeasure?.provided) {
      drawCheck(page6, font, PAGE6.securityYes);
    } else {
      drawCheck(page6, font, PAGE6.securityNo);
    }

    // === PAGE 7: Contract period, usage restrictions ===
    const page7 = pdfDoc.getPage(6);

    // Clear contract and usage restriction data areas
    clearBand(page7, 600, 160, 100, 575);  // Contract section Y 600-760
    clearBand(page7, 470, 100, 100, 575);  // Usage restrictions Y 470-570

    if (data.contract?.type) {
      clearAndWrite(page7, font, PAGE7.contractType, data.contract.type);
    }
    if (data.contract?.startDate) {
      clearAndWrite(page7, font, PAGE7.contractStart, data.contract.startDate);
    }
    if (data.contract?.endDate) {
      clearAndWrite(page7, font, PAGE7.contractEnd, data.contract.endDate);
    }
    if (data.contract?.periodYears) {
      clearAndWrite(page7, font, PAGE7.contractPeriod, data.contract.periodYears + "年間");
    }
    if (data.contract?.renewalFee) {
      drawCheck(page7, font, PAGE7.renewalFeeYes);
      clearAndWrite(page7, font, PAGE7.renewalFeeAmount, data.contract.renewalFee);
    } else {
      drawCheck(page7, font, PAGE7.renewalFeeNo);
    }
    if (data.contract?.renewalAdminFee) {
      clearAndWrite(page7, font, PAGE7.renewalAdminFee, data.contract.renewalAdminFee);
    }

    // Usage restrictions
    if (data.usageRestrictions?.purpose) {
      clearAndWrite(page7, font, PAGE7.usagePurpose, data.usageRestrictions.purpose);
    }
    if (data.usageRestrictions?.petPolicy) {
      clearAndWrite(page7, font, PAGE7.petPolicy, data.usageRestrictions.petPolicy);
    }
    if (data.usageRestrictions?.instrumentPolicy) {
      drawMultilineText(page7, font, PAGE7.instrumentPolicy, data.usageRestrictions.instrumentPolicy);
    }
    if (data.usageRestrictions?.renovationPolicy) {
      drawMultilineText(page7, font, PAGE7.renovationPolicy, data.usageRestrictions.renovationPolicy);
    }

    // === PAGE 8: Management, other matters, attachments, remarks ===
    const page8 = pdfDoc.getPage(7);

    // Clear management and notes data areas
    clearBand(page8, 615, 120, 100, 575);  // Management section Y 615-735
    clearBand(page8, 380, 90, 56, 575);    // Other matters, attachments, remarks Y 380-470

    // Building manager
    if (data.management?.buildingManager?.name) {
      clearAndWrite(page8, font, PAGE8.buildingManagerName, data.management.buildingManager.name);
      clearAndWrite(page8, font, PAGE8.buildingManagerAddress, data.management.buildingManager.address || "");
      clearAndWrite(page8, font, PAGE8.buildingManagerPhone, data.management.buildingManager.phone || "");
    }

    // Property manager
    if (data.management?.propertyManager?.name) {
      clearAndWrite(page8, font, PAGE8.propertyManagerName, data.management.propertyManager.name);
      clearAndWrite(page8, font, PAGE8.propertyManagerAddress, data.management.propertyManager.address || "");
      clearAndWrite(page8, font, PAGE8.propertyManagerPhone, data.management.propertyManager.phone || "");
    }

    // Other important matters
    if (data.otherImportantMatters) {
      drawMultilineText(page8, font, PAGE8.otherMatters, data.otherImportantMatters);
    }

    // Attachments
    if (data.attachments?.length) {
      drawMultilineText(page8, font, PAGE8.attachments, data.attachments.join("、"));
    }

    // Remarks
    if (data.remarks) {
      drawMultilineText(page8, font, PAGE8.remarks, data.remarks);
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="jusetsu.pdf"; filename*=UTF-8''${encodeURIComponent("重要事項説明書.pdf")}`,
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
