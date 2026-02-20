import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PDFPage, PDFFont, rgb, RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { JusetsuData } from "@/types/jusetsu";

export const maxDuration = 60;

// A4 dimensions in points
const PW = 595.28;
const PH = 841.89;
const ML = 42; // left margin
const MR = 42; // right margin
const MT = 35; // top margin
const MB = 40; // bottom margin
const CW = PW - ML - MR; // content width

const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.5, 0.5, 0.5);
const LIGHT_GRAY = rgb(0.85, 0.85, 0.85);

interface PDFContext {
  doc: PDFDocument;
  font: PDFFont;
  pages: PDFPage[];
  currentPage: number;
  data: JusetsuData;
}

function addPage(ctx: PDFContext): PDFPage {
  const page = ctx.doc.addPage([PW, PH]);
  ctx.pages.push(page);
  ctx.currentPage = ctx.pages.length;
  return page;
}

function drawPageNumbers(ctx: PDFContext) {
  const total = ctx.pages.length;
  ctx.pages.forEach((page, i) => {
    const text = `${i + 1}/${total}`;
    const w = ctx.font.widthOfTextAtSize(text, 8);
    page.drawText(text, { x: PW / 2 - w / 2, y: MB / 2, size: 8, font: ctx.font, color: GRAY });
  });
}

// Draw a bordered rectangle
function drawBox(page: PDFPage, x: number, y: number, w: number, h: number, opts?: { fill?: RGB; lineWidth?: number }) {
  if (opts?.fill) {
    page.drawRectangle({ x, y: y - h, width: w, height: h, color: opts.fill });
  }
  page.drawRectangle({ x, y: y - h, width: w, height: h, borderColor: BLACK, borderWidth: opts?.lineWidth ?? 0.5 });
}

// Draw text with wrapping, returns number of lines used
function drawWrappedText(page: PDFPage, text: string, x: number, y: number, maxWidth: number, font: PDFFont, size: number, lineHeight: number): number {
  if (!text) return 0;
  const lines: string[] = [];
  const paragraphs = text.split("\n");
  for (const para of paragraphs) {
    if (!para) { lines.push(""); continue; }
    let current = "";
    for (const char of para) {
      const test = current + char;
      try {
        if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
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
  lines.forEach((line, i) => {
    page.drawText(line, { x, y: y - i * lineHeight, size, font, color: BLACK });
  });
  return lines.length;
}

function checkbox(checked: boolean): string {
  return checked ? "☑" : "□";
}

function formatYen(amount: number): string {
  if (!amount) return "円";
  return `${amount.toLocaleString()}円`;
}

// Draw a table row with label and value
function drawTableRow(page: PDFPage, font: PDFFont, x: number, y: number, w: number, h: number, label: string, value: string, labelWidth: number = 100) {
  drawBox(page, x, y, w, h);
  drawBox(page, x, y, labelWidth, h, { fill: rgb(0.95, 0.95, 0.95) });
  page.drawText(label, { x: x + 4, y: y - h / 2 - 3, size: 7, font, color: BLACK });
  const lines = value.split("\n");
  lines.forEach((line, i) => {
    page.drawText(line, { x: x + labelWidth + 4, y: y - 10 - i * 10, size: 7.5, font, color: BLACK });
  });
}

export async function POST(request: NextRequest) {
  try {
    const data: JusetsuData = await request.json();

    const fontUrl = "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf";
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) throw new Error("Failed to load font");
    const fontBytes = await fontRes.arrayBuffer();

    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    const font = await doc.embedFont(fontBytes);

    const ctx: PDFContext = { doc, font, pages: [], currentPage: 0, data };

    // ========== PAGE 1: Cover ==========
    drawPage1(ctx);

    // ========== PAGE 2: Table of Contents ==========
    drawPage2(ctx);

    // ========== PAGE 3: Building, Owner, Registry, Regulations, Infrastructure ==========
    drawPage3(ctx);

    // ========== PAGE 4: Building inspection, Equipment ==========
    drawPage4(ctx);

    // ========== PAGE 5: Equipment cont, Common facilities, Hazard zones ==========
    drawPage5(ctx);

    // ========== PAGE 6: Financial, Cancellation, Penalty ==========
    drawPage6(ctx);

    // ========== PAGE 7: Contract period, Usage restrictions, Deposit settlement ==========
    drawPage7(ctx);

    // ========== PAGE 8: Management, Other matters, Attachments, Remarks ==========
    drawPage8(ctx);

    drawPageNumbers(ctx);

    const pdfBytes = await doc.save();
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

// ===== PAGE 1: Cover / Header =====
function drawPage1(ctx: PDFContext) {
  const page = addPage(ctx);
  const f = ctx.font;
  const d = ctx.data;
  let y = PH - MT;

  // Document type header
  page.drawText(d.documentType || "51-1. 居住用建物／普通賃貸借契約〔連帯保証人型〕", { x: ML, y, size: 8, font: f, color: BLACK });
  y -= 25;

  // Title
  const title = "重要事項説明書";
  const tw = f.widthOfTextAtSize(title, 22);
  page.drawText(title, { x: PW / 2 - tw / 2, y, size: 22, font: f, color: BLACK });
  y -= 25;

  // Borrower / Lender
  const halfW = CW / 2;
  drawBox(page, ML, y, CW, 20);
  page.drawText(`借主　${d.borrowerName || ""}　様`, { x: ML + 10, y: y - 14, size: 10, font: f, color: BLACK });
  page.drawLine({ start: { x: ML + halfW, y }, end: { x: ML + halfW, y: y - 20 }, thickness: 0.5, color: BLACK });
  page.drawText(`貸主　${d.lenderName || ""}　様`, { x: ML + halfW + 10, y: y - 14, size: 10, font: f, color: BLACK });
  y -= 20;

  // Explanatory text
  y -= 5;
  const introText = "宅地建物取引業法第35条及び第35条の2の規定に基づき、下記のとおり重要事項の説明を行います。" +
    "説明事項のうち☑印のある事項は該当する事項です。□欄のある事項で特に記載がないものは、売主・貸主等からの報告がなく、" +
    "宅地建物取引業者自身も確認できなかった事項です。";
  const introLines = drawWrappedText(page, introText, ML + 5, y, CW - 10, f, 7.5, 11);
  y -= introLines * 11 + 8;

  // === 取引態様 table ===
  const tableTop = y;
  const col1W = 40; // vertical header column
  const col2W = (CW - col1W) / 2;

  // 取引態様 row
  const rowH = 18;
  drawBox(page, ML, y, CW, rowH);
  page.drawText("取引態様", { x: ML + 3, y: y - 12, size: 7, font: f, color: BLACK });
  page.drawLine({ start: { x: ML + col1W, y }, end: { x: ML + col1W, y: y - rowH }, thickness: 0.5, color: BLACK });
  page.drawText(`${checkbox(d.transactionType === "媒介")} 媒介・${checkbox(d.transactionType === "代理")} 代理`, {
    x: ML + col1W + 5, y: y - 12, size: 7.5, font: f, color: BLACK
  });
  page.drawLine({ start: { x: ML + col1W + col2W, y }, end: { x: ML + col1W + col2W, y: y - rowH }, thickness: 0.5, color: BLACK });
  // Right side (斜線 for unused)
  page.drawLine({ start: { x: ML + col1W + col2W + 2, y: y - 2 }, end: { x: ML + CW - 2, y: y - rowH + 2 }, thickness: 0.3, color: GRAY });
  y -= rowH;

  // === 宅地建物取引業者 section ===
  const brokerRows = [
    { label: "免許証番号", v1: d.broker1.licenseNumber, v2: d.broker2.licenseNumber },
    { label: "主たる事務所の所在地", v1: d.broker1.officeAddress, v2: d.broker2.officeAddress },
    { label: "電話番号", v1: d.broker1.phone, v2: d.broker2.phone },
    { label: "商号または名称", v1: d.broker1.companyName, v2: d.broker2.companyName },
    { label: "代表者", v1: d.broker1.representative, v2: d.broker2.representative },
  ];
  const bRowH = 16;
  const bSectionH = bRowH * brokerRows.length;

  drawBox(page, ML, y, col1W, bSectionH);
  // Vertical text: 宅地建物取引業者
  const vText = "宅地建物取引業者";
  const vCharH = bSectionH / vText.length;
  vText.split("").forEach((ch, i) => {
    page.drawText(ch, { x: ML + 12, y: y - 10 - i * vCharH, size: 7, font: f, color: BLACK });
  });

  const labelW = 80;
  brokerRows.forEach((row, i) => {
    const ry = y - i * bRowH;
    drawBox(page, ML + col1W, ry, CW - col1W, bRowH);
    drawBox(page, ML + col1W, ry, labelW, bRowH, { fill: rgb(0.97, 0.97, 0.97) });
    page.drawText(row.label, { x: ML + col1W + 3, y: ry - 11, size: 6.5, font: f, color: BLACK });
    page.drawText(row.v1 || "", { x: ML + col1W + labelW + 3, y: ry - 11, size: 7, font: f, color: BLACK });
    page.drawLine({ start: { x: ML + col1W + col2W, y: ry }, end: { x: ML + col1W + col2W, y: ry - bRowH }, thickness: 0.5, color: BLACK });
    if (row.v2) {
      page.drawText(row.v2, { x: ML + col1W + col2W + 3, y: ry - 11, size: 7, font: f, color: BLACK });
    } else {
      page.drawLine({ start: { x: ML + col1W + col2W + 2, y: ry - 2 }, end: { x: ML + CW - 2, y: ry - bRowH + 2 }, thickness: 0.3, color: GRAY });
    }
  });
  y -= bSectionH;

  // === 説明をする宅地建物取引士 section ===
  const officerRows = [
    { label: "登録番号", v1: d.tradingOfficer1.registrationNumber, v2: d.tradingOfficer2.registrationNumber },
    { label: "氏名", v1: d.tradingOfficer1.name, v2: d.tradingOfficer2.name },
    { label: "業務に従事する事務所名", v1: d.tradingOfficer1.officeName, v2: d.tradingOfficer2.officeName },
    { label: "事務所所在地", v1: d.tradingOfficer1.officeAddress, v2: d.tradingOfficer2.officeAddress },
    { label: "電話番号", v1: d.tradingOfficer1.phone, v2: d.tradingOfficer2.phone },
  ];
  const oSectionH = bRowH * officerRows.length;

  drawBox(page, ML, y, col1W, oSectionH);
  const vText2 = "説明をする宅地建物取引士";
  const vCharH2 = oSectionH / vText2.length;
  vText2.split("").forEach((ch, i) => {
    page.drawText(ch, { x: ML + 12, y: y - 6 - i * vCharH2, size: 6, font: f, color: BLACK });
  });

  officerRows.forEach((row, i) => {
    const ry = y - i * bRowH;
    drawBox(page, ML + col1W, ry, CW - col1W, bRowH);
    drawBox(page, ML + col1W, ry, labelW, bRowH, { fill: rgb(0.97, 0.97, 0.97) });
    page.drawText(row.label, { x: ML + col1W + 3, y: ry - 11, size: 6.5, font: f, color: BLACK });
    page.drawText(row.v1 || "", { x: ML + col1W + labelW + 3, y: ry - 11, size: 7, font: f, color: BLACK });
    page.drawLine({ start: { x: ML + col1W + col2W, y: ry }, end: { x: ML + col1W + col2W, y: ry - bRowH }, thickness: 0.5, color: BLACK });
    if (row.v2) {
      page.drawText(row.v2, { x: ML + col1W + col2W + 3, y: ry - 11, size: 7, font: f, color: BLACK });
    } else {
      page.drawLine({ start: { x: ML + col1W + col2W + 2, y: ry - 2 }, end: { x: ML + CW - 2, y: ry - bRowH + 2 }, thickness: 0.3, color: GRAY });
    }
  });
  y -= oSectionH;

  // === 保証協会 section ===
  const ga = d.guaranteeAssociation;
  const gaRowH = 14;

  // Row: 宅地建物取引業保証協会の社員
  drawBox(page, ML, y, CW, gaRowH);
  page.drawText(`☑ (1) 宅地建物取引業保証協会の社員`, { x: ML + 5, y: y - 10, size: 7, font: f, color: BLACK });
  y -= gaRowH;

  // 供託所等に関する説明 section
  const gaDetailH = gaRowH * 5;
  drawBox(page, ML, y, col1W, gaDetailH);
  const vText3 = "供託所等に関する説明";
  const vCharH3 = gaDetailH / vText3.length;
  vText3.split("").forEach((ch, i) => {
    page.drawText(ch, { x: ML + 12, y: y - 6 - i * vCharH3, size: 6, font: f, color: BLACK });
  });

  const gaRows = [
    { label: "保証協会名称", value: ga.name },
    { label: "保証協会所在地", value: ga.address },
    { label: "地方本部名称・所在地", value: `${ga.localBranch}\n${ga.localBranchAddress}` },
    { label: "供託所・所在地", value: `${ga.depositOffice}\n${ga.depositOfficeAddress}` },
  ];

  let gaY = y;
  gaRows.forEach((row) => {
    drawBox(page, ML + col1W, gaY, CW - col1W, gaRowH);
    page.drawText(row.label, { x: ML + col1W + 3, y: gaY - 10, size: 6.5, font: f, color: BLACK });
    page.drawText(row.value || "", { x: ML + col1W + labelW + 3, y: gaY - 10, size: 7, font: f, color: BLACK });
    gaY -= gaRowH;
  });
  // Empty row for last
  drawBox(page, ML + col1W, gaY, CW - col1W, gaRowH);
  y -= gaDetailH;

  // === Signature section ===
  y -= 10;
  page.drawText("上記宅地建物取引士から取引士証の提示のもとに、以下の不動産の各項目について重要事項の説明を受け、説明書を受理しました。", {
    x: ML, y, size: 7.5, font: f, color: BLACK
  });
  y -= 18;
  page.drawText("令和　　年　　月　　日", { x: PW - MR - 130, y, size: 8, font: f, color: BLACK });
  y -= 20;

  // 貸主 signature
  page.drawText("貸主", { x: ML, y, size: 9, font: f, color: BLACK });
  y -= 14;
  page.drawText("（住所）", { x: ML + 10, y, size: 8, font: f, color: BLACK });
  page.drawLine({ start: { x: ML + 50, y: y - 2 }, end: { x: PW - MR, y: y - 2 }, thickness: 0.5, color: BLACK });
  y -= 14;
  page.drawText("（法人名）", { x: ML + 10, y, size: 8, font: f, color: BLACK });
  page.drawLine({ start: { x: ML + 55, y: y - 2 }, end: { x: PW - MR, y: y - 2 }, thickness: 0.5, color: BLACK });
  y -= 14;
  page.drawText("（代表者氏名）", { x: ML + 10, y, size: 8, font: f, color: BLACK });
  page.drawLine({ start: { x: ML + 70, y: y - 2 }, end: { x: PW - MR - 30, y: y - 2 }, thickness: 0.5, color: BLACK });
  page.drawText("㊞", { x: PW - MR - 15, y, size: 8, font: f, color: BLACK });
  y -= 18;

  // 借主 signature
  page.drawText("借主", { x: ML, y, size: 9, font: f, color: BLACK });
  y -= 14;
  page.drawText("（住所）", { x: ML + 10, y, size: 8, font: f, color: BLACK });
  page.drawLine({ start: { x: ML + 50, y: y - 2 }, end: { x: PW - MR, y: y - 2 }, thickness: 0.5, color: BLACK });
  y -= 14;
  page.drawText("（氏名）", { x: ML + 10, y, size: 8, font: f, color: BLACK });
  page.drawLine({ start: { x: ML + 50, y: y - 2 }, end: { x: PW - MR - 30, y: y - 2 }, thickness: 0.5, color: BLACK });
  page.drawText("㊞", { x: PW - MR - 15, y, size: 8, font: f, color: BLACK });
}

// ===== PAGE 2: Table of Contents =====
function drawPage2(ctx: PDFContext) {
  const page = addPage(ctx);
  const f = ctx.font;
  let y = PH - MT;

  const title = "目次（重要事項説明書の全体像）";
  const tw = f.widthOfTextAtSize(title, 14);
  page.drawText(title, { x: PW / 2 - tw / 2, y, size: 14, font: f, color: BLACK });
  y -= 25;

  const tocItems = [
    { text: "○取引の態様", page: "Ｐ.1", indent: 0 },
    { text: "○取引に関与する宅地建物取引業者および説明する宅地建物取引士の記載", page: "Ｐ.1", indent: 0 },
    { text: "○供託所等に関する説明", page: "Ｐ.1", indent: 0 },
    { text: "", page: "", indent: 0 },
    { text: "Ａ　建物の表示", page: "Ｐ.3", indent: 0 },
    { text: "Ｂ　貸主の表示", page: "Ｐ.3", indent: 0 },
    { text: "", page: "", indent: 0 },
    { text: "Ⅰ　対象となる建物に直接関係する事項", page: "Ｐ.3", indent: 0 },
    { text: "1. 登記記録に記録された事項", page: "Ｐ.3", indent: 1 },
    { text: "2. 法令に基づく制限の概要", page: "Ｐ.3", indent: 1 },
    { text: "3. 飲用水・電気・ガスの供給施設および排水施設の整備状況", page: "Ｐ.3", indent: 1 },
    { text: "4. 建物建築の工事完了時における形状・構造等（未完成物件のとき）", page: "Ｐ.4", indent: 1 },
    { text: "5. 建物状況調査の結果の概要（既存の住宅のとき）", page: "Ｐ.4", indent: 1 },
    { text: "6. 建物の設備の整備の状況（完成物件のとき）", page: "Ｐ.4", indent: 1 },
    { text: "7. 当該建物が造成宅地防災区域内か否か", page: "Ｐ.5", indent: 1 },
    { text: "8. 当該建物が土砂災害警戒区域内か否か", page: "Ｐ.5", indent: 1 },
    { text: "9. 当該建物が津波災害警戒区域内か否か", page: "Ｐ.5", indent: 1 },
    { text: "10. 水防法に基づく水害ハザードマップにおける当該建物の所在地", page: "Ｐ.5", indent: 1 },
    { text: "11. 石綿（アスベスト）使用調査の内容", page: "Ｐ.5", indent: 1 },
    { text: "12. 耐震診断の内容", page: "Ｐ.5", indent: 1 },
    { text: "", page: "", indent: 0 },
    { text: "Ⅱ　取引条件に関する事項", page: "Ｐ.6", indent: 0 },
    { text: "1. 借賃および借賃以外に授受される金額", page: "Ｐ.6", indent: 1 },
    { text: "2. 契約の解除に関する事項", page: "Ｐ.6", indent: 1 },
    { text: "3. 損害賠償額の予定または違約金に関する事項", page: "Ｐ.6", indent: 1 },
    { text: "4. 支払金または預り金の保全措置の概要", page: "Ｐ.6", indent: 1 },
    { text: "5. 契約期間および更新に関する事項", page: "Ｐ.7", indent: 1 },
    { text: "6. 用途その他の利用の制限に関する事項", page: "Ｐ.7", indent: 1 },
    { text: "7. 敷金等の精算に関する事項", page: "Ｐ.7", indent: 1 },
    { text: "8. 管理の委託先", page: "Ｐ.8", indent: 1 },
    { text: "", page: "", indent: 0 },
    { text: "Ⅲ　その他重要な事項", page: "Ｐ.8", indent: 0 },
    { text: "Ⅳ　添付書類", page: "Ｐ.8", indent: 0 },
    { text: "Ⅴ　備考", page: "Ｐ.8", indent: 0 },
  ];

  const lineH = 15;
  tocItems.forEach((item) => {
    if (!item.text) { y -= 8; return; }
    const indent = item.indent * 20;
    page.drawText(item.text, { x: ML + indent, y, size: 8.5, font: f, color: BLACK });
    if (item.page) {
      const pw = f.widthOfTextAtSize(item.page, 8.5);
      page.drawText(item.page, { x: PW - MR - pw, y, size: 8.5, font: f, color: BLACK });
    }
    y -= lineH;
  });
}

// ===== PAGE 3: A. Building, B. Landlord, I-1 Registry, I-2 Legal, I-3 Infra =====
function drawPage3(ctx: PDFContext) {
  const page = addPage(ctx);
  const f = ctx.font;
  const d = ctx.data;
  let y = PH - MT;
  const rH = 16;
  const lW = 80;

  // A. 建物の表示
  page.drawText("Ａ　建物の表示", { x: ML, y, size: 10, font: f, color: BLACK });
  y -= 14;

  const bldg = d.building;
  const buildingRows = [
    { label: "建物の名称", value: bldg.name },
    { label: "所在地（住居表示）", value: bldg.addressDisplay },
    { label: "所在地（登記簿）", value: bldg.addressRegistry },
    { label: "種類", value: `${checkbox(bldg.type === "マンション")} マンション　${checkbox(bldg.type === "アパート")} アパート　${checkbox(bldg.type === "戸建")} 戸建　${checkbox(bldg.type === "テラスハウス")} テラスハウス` },
    { label: "構造", value: bldg.structure },
    { label: "床面積", value: `${bldg.floorArea}　　間取り ${bldg.layout}` },
    { label: "建築時期", value: bldg.builtDate },
  ];

  buildingRows.forEach((row) => {
    drawTableRow(page, f, ML, y, CW, rH, row.label, row.value, lW);
    y -= rH;
  });
  y -= 8;

  // B. 貸主の表示
  const ll = d.landlord;
  page.drawText(`Ｂ　貸主の表示　（${checkbox(ll.sameAsOwner)} 1. 登記簿記載の所有者と同じ・${checkbox(!ll.sameAsOwner)} 2. 登記簿記載の所有者と異なる）`, {
    x: ML, y, size: 8, font: f, color: BLACK
  });
  y -= 12;

  [
    { label: "住所", value: ll.address },
    { label: "氏名", value: ll.name },
    { label: "備考", value: ll.remarks },
  ].forEach((row) => {
    drawTableRow(page, f, ML, y, CW, rH, row.label, row.value, 50);
    y -= rH;
  });
  y -= 8;

  // Ⅰ header
  page.drawText("Ⅰ　対象となる建物に直接関係する事項", { x: ML, y, size: 10, font: f, color: BLACK });
  y -= 14;

  // 1. 登記記録
  const reg = d.registry;
  page.drawText("1. 登記記録に記録された事項", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;

  page.drawText("権利部（甲区）", { x: ML + 5, y, size: 7.5, font: f, color: BLACK });
  y -= 10;
  [
    { label: "所有者住所", value: reg.ownerAddress },
    { label: "所有者氏名", value: reg.ownerName },
    { label: "所有権にかかる権利", value: `${checkbox(reg.ownershipRights)} 有・${checkbox(!reg.ownershipRights)} 無　${reg.ownershipRightsDetail}` },
  ].forEach((row) => {
    drawTableRow(page, f, ML, y, CW, rH, row.label, row.value, lW);
    y -= rH;
  });

  page.drawText("権利部（乙区）", { x: ML + 5, y, size: 7.5, font: f, color: BLACK });
  y -= 10;
  drawTableRow(page, f, ML, y, CW, rH, "所有権以外の権利", `${checkbox(reg.otherRights)} 有・${checkbox(!reg.otherRights)} 無　${reg.otherRightsDetail}`, lW);
  y -= rH;
  y -= 8;

  // 2. 法令に基づく制限
  page.drawText("2. 法令に基づく制限の概要", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;
  drawBox(page, ML, y, CW, 30);
  drawWrappedText(page, d.legalRestrictions || "特になし", ML + 5, y - 8, CW - 10, f, 7, 10);
  y -= 30;
  y -= 8;

  // 3. インフラ
  page.drawText("3. 飲用水・電気・ガスの供給施設および排水施設の整備状況", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;

  const infra = d.infrastructure;
  [
    { label: "飲用水", value: `${checkbox(infra.water.available)} 整備済　供給元: ${infra.water.provider}　${infra.water.remarks}` },
    { label: "電気", value: `${checkbox(infra.electricity.available)} 整備済　供給元: ${infra.electricity.provider}　${infra.electricity.remarks}` },
    { label: "ガス", value: `${checkbox(infra.gas.available)} 整備済　${infra.gas.type}　供給元: ${infra.gas.provider}　${infra.gas.remarks}` },
    { label: "排水", value: `${checkbox(infra.drainage.available)} 整備済　${infra.drainage.type}　${infra.drainage.remarks}` },
  ].forEach((row) => {
    drawTableRow(page, f, ML, y, CW, rH, row.label, row.value, 50);
    y -= rH;
  });
}

// ===== PAGE 4: Building inspection, Equipment (items 1-18) =====
function drawPage4(ctx: PDFContext) {
  const page = addPage(ctx);
  const f = ctx.font;
  const d = ctx.data;
  let y = PH - MT;
  const rH = 14;

  // 4. Building construction (usually N/A for existing buildings)
  page.drawText("4. 建物建築の工事完了時における形状・構造等（未完成物件のとき）", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;
  drawBox(page, ML, y, CW, 18);
  page.drawText("該当なし", { x: ML + 5, y: y - 12, size: 7, font: f, color: GRAY });
  y -= 18;
  y -= 8;

  // 5. Building inspection
  page.drawText("5. 建物状況調査の結果の概要（既存の住宅のとき）", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;
  const bi = d.buildingInspection;
  drawBox(page, ML, y, CW, 22);
  page.drawText(`${checkbox(bi.applicable)} 該当する　${checkbox(!bi.applicable)} 該当しない　　実施: ${checkbox(bi.conducted)} 有・${checkbox(!bi.conducted)} 無`, {
    x: ML + 5, y: y - 10, size: 7.5, font: f, color: BLACK
  });
  if (bi.summary) {
    page.drawText(bi.summary, { x: ML + 5, y: y - 20, size: 7, font: f, color: BLACK });
  }
  y -= 22;
  y -= 8;

  // 6. Equipment
  page.drawText("6. 建物の設備の整備の状況（完成物件のとき）", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;

  // Header row
  const numW = 25;
  const nameW = 80;
  const checkW = 55;
  const detailW = CW - numW - nameW - checkW;

  drawBox(page, ML, y, numW, rH, { fill: LIGHT_GRAY });
  drawBox(page, ML + numW, y, nameW, rH, { fill: LIGHT_GRAY });
  drawBox(page, ML + numW + nameW, y, checkW, rH, { fill: LIGHT_GRAY });
  drawBox(page, ML + numW + nameW + checkW, y, detailW, rH, { fill: LIGHT_GRAY });
  page.drawText("No.", { x: ML + 3, y: y - 10, size: 6.5, font: f, color: BLACK });
  page.drawText("設備名", { x: ML + numW + 3, y: y - 10, size: 6.5, font: f, color: BLACK });
  page.drawText("有・無", { x: ML + numW + nameW + 3, y: y - 10, size: 6.5, font: f, color: BLACK });
  page.drawText("備考", { x: ML + numW + nameW + checkW + 3, y: y - 10, size: 6.5, font: f, color: BLACK });
  y -= rH;

  const equipItems: [string, string, keyof typeof d.equipment][] = [
    ["1", "電気", "electricity"],
    ["2", "ガス", "gas"],
    ["3", "コンロ", "stove"],
    ["4", "上水道", "waterSupply"],
    ["5", "下水道", "sewage"],
    ["6", "台所", "kitchen"],
    ["7", "トイレ", "toilet"],
    ["8", "浴室", "bathroom"],
    ["9", "洗面台", "washstand"],
    ["10", "洗濯機置場", "laundry"],
    ["11", "給湯設備", "hotWater"],
    ["12", "冷暖房", "aircon"],
    ["13", "照明器具", "lighting"],
    ["14", "備付家具", "furniture"],
    ["15", "地デジ", "digitalTV"],
    ["16", "CATV", "catv"],
    ["17", "インターネット", "internet"],
    ["18", "トランクルーム", "trunkRoom"],
  ];

  equipItems.forEach(([num, name, key]) => {
    const item = d.equipment[key];
    drawBox(page, ML, y, numW, rH);
    drawBox(page, ML + numW, y, nameW, rH);
    drawBox(page, ML + numW + nameW, y, checkW, rH);
    drawBox(page, ML + numW + nameW + checkW, y, detailW, rH);
    page.drawText(num, { x: ML + 8, y: y - 10, size: 7, font: f, color: BLACK });
    page.drawText(name, { x: ML + numW + 3, y: y - 10, size: 7, font: f, color: BLACK });
    page.drawText(`${checkbox(item.exists)} 有・${checkbox(!item.exists)} 無`, { x: ML + numW + nameW + 3, y: y - 10, size: 7, font: f, color: BLACK });
    page.drawText(item.detail || "", { x: ML + numW + nameW + checkW + 3, y: y - 10, size: 6.5, font: f, color: BLACK });
    y -= rH;
  });
}

// ===== PAGE 5: Equipment cont (19-21), Common facilities, Hazard zones, Hazard map, Asbestos, Earthquake =====
function drawPage5(ctx: PDFContext) {
  const page = addPage(ctx);
  const f = ctx.font;
  const d = ctx.data;
  let y = PH - MT;
  const rH = 14;

  // Equipment items 19-21
  const numW = 25;
  const nameW = 80;
  const checkW = 55;
  const detailW = CW - numW - nameW - checkW;

  const remainingEquip: [string, string, keyof typeof d.equipment][] = [
    ["19", "専用庭", "garden"],
    ["20", "ルーフバルコニー", "roofBalcony"],
    ["21", "鍵", "keys"],
  ];

  remainingEquip.forEach(([num, name, key]) => {
    const item = d.equipment[key];
    drawBox(page, ML, y, numW, rH);
    drawBox(page, ML + numW, y, nameW, rH);
    drawBox(page, ML + numW + nameW, y, checkW, rH);
    drawBox(page, ML + numW + nameW + checkW, y, detailW, rH);
    page.drawText(num, { x: ML + 8, y: y - 10, size: 7, font: f, color: BLACK });
    page.drawText(name, { x: ML + numW + 3, y: y - 10, size: 7, font: f, color: BLACK });
    page.drawText(`${checkbox(item.exists)} 有・${checkbox(!item.exists)} 無`, { x: ML + numW + nameW + 3, y: y - 10, size: 7, font: f, color: BLACK });
    page.drawText(item.detail || "", { x: ML + numW + nameW + checkW + 3, y: y - 10, size: 6.5, font: f, color: BLACK });
    y -= rH;
  });
  y -= 8;

  // Common facilities
  page.drawText("共用部分の設備・施設等", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;

  drawBox(page, ML, y, numW, rH, { fill: LIGHT_GRAY });
  drawBox(page, ML + numW, y, nameW, rH, { fill: LIGHT_GRAY });
  drawBox(page, ML + numW + nameW, y, checkW, rH, { fill: LIGHT_GRAY });
  drawBox(page, ML + numW + nameW + checkW, y, detailW, rH, { fill: LIGHT_GRAY });
  page.drawText("No.", { x: ML + 3, y: y - 10, size: 6.5, font: f, color: BLACK });
  page.drawText("設備名", { x: ML + numW + 3, y: y - 10, size: 6.5, font: f, color: BLACK });
  page.drawText("有・無", { x: ML + numW + nameW + 3, y: y - 10, size: 6.5, font: f, color: BLACK });
  page.drawText("利用の可否・内容等", { x: ML + numW + nameW + checkW + 3, y: y - 10, size: 6.5, font: f, color: BLACK });
  y -= rH;

  const commonItems: [string, string, keyof typeof d.commonFacilities][] = [
    ["1", "エレベーター", "elevator"],
    ["2", "オートロック", "autoLock"],
    ["3", "メールボックス", "mailbox"],
    ["4", "宅配ボックス", "deliveryBox"],
    ["5", "トランクルーム", "trunkRoom"],
    ["6", "駐車場", "parking"],
    ["7", "駐輪場", "bicycle"],
    ["8", "バイク置場", "bikeParking"],
  ];

  commonItems.forEach(([num, name, key]) => {
    const item = d.commonFacilities[key];
    drawBox(page, ML, y, numW, rH);
    drawBox(page, ML + numW, y, nameW, rH);
    drawBox(page, ML + numW + nameW, y, checkW, rH);
    drawBox(page, ML + numW + nameW + checkW, y, detailW, rH);
    page.drawText(num, { x: ML + 8, y: y - 10, size: 7, font: f, color: BLACK });
    page.drawText(name, { x: ML + numW + 3, y: y - 10, size: 7, font: f, color: BLACK });
    page.drawText(`${checkbox(item.exists)} 有・${checkbox(!item.exists)} 無`, { x: ML + numW + nameW + 3, y: y - 10, size: 7, font: f, color: BLACK });
    page.drawText(item.detail || "", { x: ML + numW + nameW + checkW + 3, y: y - 10, size: 6.5, font: f, color: BLACK });
    y -= rH;
  });
  y -= 8;

  // 7. 造成宅地防災区域
  const hz = d.hazardZones;
  page.drawText("7. 当該建物が造成宅地防災区域内か否か", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;
  drawBox(page, ML, y, CW, rH);
  page.drawText(`造成宅地防災区域　${checkbox(!hz.developedLandDisasterZone)} 外・${checkbox(hz.developedLandDisasterZone)} 内`, {
    x: ML + 5, y: y - 10, size: 7.5, font: f, color: BLACK
  });
  y -= rH;
  y -= 6;

  // 8. 土砂災害
  page.drawText("8. 当該建物が土砂災害警戒区域内か否か", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;
  drawBox(page, ML, y, CW, rH * 2);
  page.drawText(`1. 土砂災害警戒区域　${checkbox(!hz.landslideWarningZone)} 外・${checkbox(hz.landslideWarningZone)} 内`, {
    x: ML + 5, y: y - 10, size: 7.5, font: f, color: BLACK
  });
  page.drawText(`2. 土砂災害特別警戒区域　${checkbox(!hz.landslideSpecialZone)} 外・${checkbox(hz.landslideSpecialZone)} 内`, {
    x: ML + 5, y: y - 10 - rH, size: 7.5, font: f, color: BLACK
  });
  y -= rH * 2;
  y -= 6;

  // 9. 津波
  page.drawText("9. 当該建物が津波災害警戒区域内か否か", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;
  drawBox(page, ML, y, CW, rH * 2);
  page.drawText(`1. 津波災害警戒区域　${checkbox(!hz.tsunamiWarningZone)} 外・${checkbox(hz.tsunamiWarningZone)} 内`, {
    x: ML + 5, y: y - 10, size: 7.5, font: f, color: BLACK
  });
  page.drawText(`2. 津波災害特別警戒区域　${checkbox(!hz.tsunamiSpecialZone)} 外・${checkbox(hz.tsunamiSpecialZone)} 内`, {
    x: ML + 5, y: y - 10 - rH, size: 7.5, font: f, color: BLACK
  });
  y -= rH * 2;
  y -= 6;

  // 10. ハザードマップ
  const hm = d.hazardMap;
  page.drawText("10. 水防法に基づく水害ハザードマップにおける当該建物の所在地（位置）", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;
  drawBox(page, ML, y, CW, rH);
  page.drawText(`水害ハザードマップの有無　洪水 ${checkbox(hm.floodExists)} 有・${checkbox(!hm.floodExists)} 無　　雨水出水 ${checkbox(hm.stormWaterExists)} 有・${checkbox(!hm.stormWaterExists)} 無　　高潮 ${checkbox(hm.stormSurgeExists)} 有・${checkbox(!hm.stormSurgeExists)} 無`, {
    x: ML + 5, y: y - 10, size: 7, font: f, color: BLACK
  });
  y -= rH;
  drawBox(page, ML, y, CW, rH);
  page.drawText(`所在地: ${hm.floodDetail || hm.stormWaterDetail || hm.stormSurgeDetail || ""}`, {
    x: ML + 5, y: y - 10, size: 7, font: f, color: BLACK
  });
  y -= rH;
  y -= 6;

  // 11. Asbestos
  const asb = d.asbestos;
  page.drawText("11. 石綿（アスベスト）使用調査の内容", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;
  drawBox(page, ML, y, CW, rH);
  page.drawText(`照会先: ${asb.inquiryTarget}`, { x: ML + 5, y: y - 10, size: 7, font: f, color: BLACK });
  y -= rH;
  drawBox(page, ML, y, CW, rH);
  page.drawText(`調査結果の記録　${checkbox(asb.recordExists)} 有・${checkbox(!asb.recordExists)} 無　${asb.detail}`, {
    x: ML + 5, y: y - 10, size: 7, font: f, color: BLACK
  });
  y -= rH;
  y -= 6;

  // 12. Earthquake
  const eq = d.earthquake;
  page.drawText(`12. 耐震診断の内容（${checkbox(eq.applicable)} 該当する・${checkbox(!eq.applicable)} 該当しないので説明を省略します）`, {
    x: ML, y, size: 8.5, font: f, color: BLACK
  });
  y -= 12;
  drawBox(page, ML, y, CW, rH);
  page.drawText(`耐震診断の有無　${checkbox(eq.diagnosisExists)} 有・${checkbox(!eq.diagnosisExists)} 無　${eq.detail}`, {
    x: ML + 5, y: y - 10, size: 7, font: f, color: BLACK
  });
  y -= rH;
}

// ===== PAGE 6: Financial, Cancellation, Penalty, Security measure =====
function drawPage6(ctx: PDFContext) {
  const page = addPage(ctx);
  const f = ctx.font;
  const d = ctx.data;
  let y = PH - MT;
  const rH = 16;

  page.drawText("Ⅱ　取引条件に関する事項", { x: ML, y, size: 10, font: f, color: BLACK });
  y -= 16;

  // 1. 賃料
  page.drawText("1. 借賃および借賃以外に授受される金額", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;

  // Table header
  const col1 = 25;
  const col2 = 130;
  const col3 = 180;
  const col4 = CW - col1 - col2 - col3;

  drawBox(page, ML, y, col1, rH, { fill: LIGHT_GRAY });
  drawBox(page, ML + col1, y, col2, rH, { fill: LIGHT_GRAY });
  drawBox(page, ML + col1 + col2, y, col3, rH, { fill: LIGHT_GRAY });
  drawBox(page, ML + col1 + col2 + col3, y, col4, rH, { fill: LIGHT_GRAY });
  page.drawText("No.", { x: ML + 3, y: y - 11, size: 6.5, font: f, color: BLACK });
  page.drawText("授受の目的", { x: ML + col1 + 3, y: y - 11, size: 6.5, font: f, color: BLACK });
  page.drawText("金額", { x: ML + col1 + col2 + 3, y: y - 11, size: 6.5, font: f, color: BLACK });
  page.drawText("備考", { x: ML + col1 + col2 + col3 + 3, y: y - 11, size: 6.5, font: f, color: BLACK });
  y -= rH;

  const fin = d.financials;
  const feeRows: [string, string, string][] = [
    ["1", "賃料", `月額 ${formatYen(fin.rent)}`],
    ["2", "共益費（管理費）", `月額 ${formatYen(fin.managementFee)}`],
    ["3", "保証金（敷金）", formatYen(fin.deposit)],
    ["4", "礼金", formatYen(fin.keyMoney)],
    ...(fin.otherFees || []).map((fee, i) => [String(i + 5), fee.name, fee.amount] as [string, string, string]),
  ];

  feeRows.forEach(([num, name, amount]) => {
    drawBox(page, ML, y, col1, rH);
    drawBox(page, ML + col1, y, col2, rH);
    drawBox(page, ML + col1 + col2, y, col3, rH);
    drawBox(page, ML + col1 + col2 + col3, y, col4, rH);
    page.drawText(num, { x: ML + 8, y: y - 11, size: 7, font: f, color: BLACK });
    page.drawText(name, { x: ML + col1 + 3, y: y - 11, size: 7, font: f, color: BLACK });
    page.drawText(amount, { x: ML + col1 + col2 + 3, y: y - 11, size: 7, font: f, color: BLACK });
    y -= rH;
  });
  y -= 4;

  // Payment info
  drawBox(page, ML, y, CW, rH);
  page.drawText(`支払時期: ${fin.paymentDeadline}　　支払方法: ${fin.paymentMethod}`, {
    x: ML + 5, y: y - 11, size: 7, font: f, color: BLACK
  });
  y -= rH;
  if (fin.bankInfo) {
    drawBox(page, ML, y, CW, 20);
    drawWrappedText(page, fin.bankInfo, ML + 5, y - 8, CW - 10, f, 7, 10);
    y -= 20;
  }
  y -= 8;

  // 2. 契約解除
  page.drawText("2. 契約の解除に関する事項", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 10;
  const cancLines = drawWrappedText(page, d.cancellation || "契約書に記載のとおり", ML + 5, y - 5, CW - 10, f, 6.5, 9);
  const cancH = Math.max(40, cancLines * 9 + 15);
  drawBox(page, ML, y, CW, cancH);
  drawWrappedText(page, d.cancellation || "契約書に記載のとおり", ML + 5, y - 8, CW - 10, f, 6.5, 9);
  y -= cancH;
  y -= 6;

  // 3. 違約金
  const pen = d.penalty;
  page.drawText("3. 損害賠償額の予定または違約金に関する事項", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;
  drawBox(page, ML, y, CW, rH);
  page.drawText(`定め ${checkbox(!pen.exists)} 無・${checkbox(pen.exists)} 有 ⇒ ${pen.detail || ""}`, {
    x: ML + 5, y: y - 11, size: 7, font: f, color: BLACK
  });
  y -= rH;
  y -= 6;

  // 4. 保全措置
  const sec = d.securityMeasure;
  page.drawText("4. 支払金または預り金の保全措置の概要", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;
  drawBox(page, ML, y, CW, rH);
  page.drawText(`${checkbox(sec.provided)} 講ずる・${checkbox(!sec.provided)} 講じない　${sec.detail || ""}`, {
    x: ML + 5, y: y - 11, size: 7, font: f, color: BLACK
  });
  y -= rH;
}

// ===== PAGE 7: Contract period, Usage restrictions, Deposit settlement =====
function drawPage7(ctx: PDFContext) {
  const page = addPage(ctx);
  const f = ctx.font;
  const d = ctx.data;
  let y = PH - MT;
  const rH = 16;
  const lW = 100;

  // 5. 契約期間
  page.drawText("5. 契約期間および更新に関する事項", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;

  const con = d.contract;
  [
    { label: "契約種別", value: con.type },
    { label: "契約期間", value: `${con.startDate} 〜 ${con.endDate}（${con.periodYears}年間）` },
    { label: "更新条件", value: con.renewalTerms },
    { label: "更新料", value: con.renewalFee },
    { label: "更新事務手数料", value: con.renewalAdminFee },
  ].forEach((row) => {
    drawTableRow(page, f, ML, y, CW, rH, row.label, row.value, lW);
    y -= rH;
  });
  y -= 8;

  // 6. 用途制限
  page.drawText("6. 用途その他の利用の制限に関する事項", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;

  const use = d.usageRestrictions;
  [
    { label: "使用目的", value: use.purpose },
    { label: "ペット飼育", value: use.petPolicy || "—" },
    { label: "楽器演奏", value: use.instrumentPolicy || "—" },
    { label: "リフォーム", value: use.renovationPolicy || "—" },
    { label: "その他", value: use.other || "—" },
  ].forEach((row) => {
    drawTableRow(page, f, ML, y, CW, rH, row.label, row.value, lW);
    y -= rH;
  });
  y -= 8;

  // 7. 敷金精算
  page.drawText("7. 敷金等の精算に関する事項", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;
  const depH = 50;
  drawBox(page, ML, y, CW, depH);
  drawWrappedText(page, d.depositSettlement || "敷金は、未払賃料等があればこれを控除した残額を返還する。", ML + 5, y - 8, CW - 10, f, 7, 10);
  y -= depH;
}

// ===== PAGE 8: Management, Other matters, Attachments, Remarks =====
function drawPage8(ctx: PDFContext) {
  const page = addPage(ctx);
  const f = ctx.font;
  const d = ctx.data;
  let y = PH - MT;
  const rH = 16;
  const lW = 80;

  // 8. 管理委託先
  page.drawText("8. 管理の委託先", { x: ML, y, size: 8.5, font: f, color: BLACK });
  y -= 12;

  page.drawText("建物管理", { x: ML + 5, y, size: 7.5, font: f, color: BLACK });
  y -= 10;
  const bm = d.management.buildingManager;
  [
    { label: "名称", value: bm.name },
    { label: "住所", value: bm.address },
    { label: "電話", value: bm.phone },
    { label: "担当者", value: bm.person },
  ].forEach((row) => {
    drawTableRow(page, f, ML, y, CW, rH, row.label, row.value, lW);
    y -= rH;
  });
  y -= 6;

  page.drawText("賃貸管理", { x: ML + 5, y, size: 7.5, font: f, color: BLACK });
  y -= 10;
  const pm = d.management.propertyManager;
  [
    { label: "名称", value: pm.name },
    { label: "住所", value: pm.address },
    { label: "電話", value: pm.phone },
    { label: "担当者", value: pm.person },
  ].forEach((row) => {
    drawTableRow(page, f, ML, y, CW, rH, row.label, row.value, lW);
    y -= rH;
  });
  y -= 10;

  // Ⅲ その他重要な事項
  page.drawText("Ⅲ　その他重要な事項", { x: ML, y, size: 10, font: f, color: BLACK });
  y -= 12;
  const otherH = 80;
  drawBox(page, ML, y, CW, otherH);
  drawWrappedText(page, d.otherImportantMatters || "", ML + 5, y - 8, CW - 10, f, 7, 10);
  y -= otherH;
  y -= 8;

  // Ⅳ 添付書類
  page.drawText("Ⅳ　添付書類", { x: ML, y, size: 10, font: f, color: BLACK });
  y -= 12;
  const attH = 40;
  drawBox(page, ML, y, CW, attH);
  const attText = (d.attachments || []).join("、") || "なし";
  drawWrappedText(page, attText, ML + 5, y - 8, CW - 10, f, 7, 10);
  y -= attH;
  y -= 8;

  // Ⅴ 備考
  page.drawText("Ⅴ　備考", { x: ML, y, size: 10, font: f, color: BLACK });
  y -= 12;
  const remH = 80;
  drawBox(page, ML, y, CW, remH);
  drawWrappedText(page, d.remarks || "", ML + 5, y - 8, CW - 10, f, 7, 10);
  y -= remH;
}
