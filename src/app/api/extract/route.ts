import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { defaultJusetsuData, JusetsuData } from "@/types/jusetsu";

export const maxDuration = 120;

async function extractWithClaude(
  client: Anthropic,
  pdfBase64: string,
  docType: "contract" | "registry"
): Promise<Partial<JusetsuData>> {
  const prompt =
    docType === "contract"
      ? `この賃貸借契約書PDFから以下の情報を抽出してJSON形式で返してください。
値が見つからない場合は空文字""にしてください。

{
  "propertyName": "物件名称（マンション名・ビル名等）",
  "address": "所在地（住所。都道府県から番地まで）",
  "roomNumber": "部屋番号（号室）",
  "layout": "間取り（1LDK等）",
  "structure": "構造（RC造・鉄骨造等）",
  "area": "専有面積（㎡。数値+単位）",
  "builtDate": "築年月（建物の建築年月。例: 2005年3月）",
  "stories": "階建て数（例: 地上5階建て、地下1階地上10階建て）",
  "floor": "所在階（部屋がある階。例: 3階）",
  "zoning": "用途地域",
  "water": "飲用水（公営水道等）",
  "electricity": "電気（○○電力等）",
  "gas": "ガス（都市ガス/プロパン等）",
  "drainage": "排水（公共下水等）",
  "kitchen": "台所設備",
  "bathroom": "浴室設備",
  "toilet": "トイレ設備",
  "aircon": "エアコン",
  "otherEquipment": "その他設備",
  "rent": "月額賃料（例: 85,000円 → 85000。「税込」「税別」注記があれば含める）",
  "managementFee": "管理費・共益費（金額。例: 5000）",
  "deposit": "敷金（金額。「◯ヶ月」の場合は賃料×月数で計算）",
  "keyMoney": "礼金（金額。「◯ヶ月」の場合は賃料×月数で計算）",
  "otherFees": "その他費用（仲介手数料、保証料等）",
  "contractStart": "契約開始日（西暦で。例: 2024年4月1日）",
  "contractEnd": "契約終了日（西暦で。例: 2026年3月31日）",
  "renewalCondition": "更新条件",
  "tenantName": "借主（乙）の氏名",
  "tenantAddress": "借主（乙）の住所",
  "paymentDeadline": "賃料支払期限（例: 毎月末日まで、翌月分を毎月27日まで等）",
  "paymentMethod": "支払方法（振込先銀行名・支店名・口座番号等）",
  "earthquakeResistance": "耐震診断の有無と結果",
  "asbestos": "石綿使用調査の有無と結果",
  "cancellationTerms": "解約条件（解約予告期間等）",
  "penalty": "違約金",
  "earlyTerminationPenalty": "短期解約違約金（1年未満解約時の違約金額等）",
  "cleaningFee": "退去時クリーニング代（金額・条件）",
  "keyChangeFee": "鍵交換費用（金額・条件）",
  "noticePeriod": "解約予告期間（何ヶ月前までに通知が必要か）",
  "rentProrationOnCancel": "解約時日割り計算（日割り計算の有無・方法）",
  "petPolicy": "ペット飼育の可否・条件",
  "instrumentPolicy": "楽器演奏の可否・条件",
  "restorationObligation": "原状回復条件（借主負担の範囲・内容）",
  "insuranceRequirement": "火災保険加入義務（加入必須か・指定保険会社等）",
  "guarantorInfo": "連帯保証人条件（保証人の要件・保証会社利用等）",
  "parking": "駐車場・駐輪場（有無・料金・条件）",
  "internet": "インターネット環境（回線種別・費用・制限等）",
  "prohibitedItems": "禁止事項（禁止行為の一覧）",
  "keyCount": "貸与鍵の本数・種類",
  "renewalProcedure": "更新手続き方法（更新料・手続き詳細）",
  "otherSpecialTerms": "その他特約事項（上記に該当しない特約を全て記載）",
  "brokerName": "仲介業者名（宅建業者の商号）",
  "brokerLicense": "宅地建物取引業者の免許番号（例: 東京都知事(3)第12345号）",
  "tradingOfficerName": "宅地建物取引士の氏名",
  "managementCompany": "管理会社名",
  "landlordName": "貸主（甲）の名前"
}

**特約事項の抽出について重要：**
- 「特約条項」「特約事項」「付帯条件」「覚書」「別記」「特記事項」「追加条件」「付則」「補足事項」セクションを重点的に探す
- 契約書の本文だけでなく、裏面・別紙・付録・覚書なども全て対象
- 原状回復、火災保険、連帯保証人、駐車場、インターネット、禁止事項、鍵、更新手続き、クリーニング代、鍵交換代、短期解約違約金は必ず探す
- 金額はカンマなしの数字。「税込」「税別」の注記があればそれも含める
- 令和・平成の日付は西暦に変換

**抽出精度を上げるための注意：**
- 金額はカンマなしの数字で返す（例: 50000）。ただし「税込」「税別」等あればそれも含める
- 敷金・礼金が「◯ヶ月」表記の場合、賃料×月数で計算した金額を返す
- 令和・平成の日付は西暦に変換（例: 令和6年 → 2024年）
- 契約書の全ページ（裏面・別紙含む）から情報を探す

JSONのみ返してください。説明文は不要です。`
      : `この登記簿謄本PDFから以下の情報を抽出してJSON形式で返してください。
値が見つからない場合は空文字""にしてください。

{
  "owner": "所有者（甲区に記載の所有権者の氏名/法人名）",
  "mortgage": "抵当権等（乙区に記載の抵当権・根抵当権等。なければ「なし」）",
  "address": "所在地",
  "structure": "構造",
  "area": "床面積"
}

JSONのみ返してください。説明文は不要です。`;

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const text = res.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return {};
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {};
  }
}

async function getHazardInfo(address: string): Promise<Partial<JusetsuData>> {
  try {
    const geoRes = await fetch(
      `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`
    );
    const geoData = await geoRes.json();
    if (!geoData || geoData.length === 0) {
      return {
        floodRisk: "住所から位置情報を取得できませんでした。要確認。",
        landslideRisk: "住所から位置情報を取得できませんでした。要確認。",
        tsunamiRisk: "住所から位置情報を取得できませんでした。要確認。",
      };
    }

    const [lon, lat] = geoData[0].geometry.coordinates;
    const results: Partial<JusetsuData> = {};

    results.floodRisk = `緯度${lat.toFixed(4)}, 経度${lon.toFixed(4)}付近。市区町村のハザードマップで要確認。`;
    results.landslideRisk = "市区町村のハザードマップで要確認。";
    results.tsunamiRisk = "市区町村のハザードマップで要確認。";

    // Generate hazard map images
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const types = [
      { type: "flood", key: "floodMapImage" },
      { type: "landslide", key: "landslideMapImage" },
      { type: "tsunami", key: "tsunamiMapImage" },
    ] as const;

    const mapResults = await Promise.allSettled(
      types.map(async ({ type, key }) => {
        const res = await fetch(`${baseUrl}/api/hazard-map`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon, type }),
        });
        if (!res.ok) return { key, image: "" };
        const data = await res.json();
        return { key, image: data.image || "" };
      })
    );

    for (const r of mapResults) {
      if (r.status === "fulfilled" && r.value.image) {
        (results as Record<string, string>)[r.value.key] = r.value.image;
      }
    }

    return results;
  } catch {
    return {
      floodRisk: "要確認",
      landslideRisk: "要確認",
      tsunamiRisk: "要確認",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const contractFile = formData.get("contract") as File;
    const registryFile = formData.get("registry") as File;

    if (!contractFile || !registryFile) {
      return NextResponse.json({ error: "両方のPDFが必要です" }, { status: 400 });
    }

    const client = new Anthropic();

    // Convert files to base64
    const [contractB64, registryB64] = await Promise.all([
      contractFile.arrayBuffer().then((b) => Buffer.from(b).toString("base64")),
      registryFile.arrayBuffer().then((b) => Buffer.from(b).toString("base64")),
    ]);

    // Extract info with Claude (PDF directly)
    const [contractData, registryData] = await Promise.all([
      extractWithClaude(client, contractB64, "contract"),
      extractWithClaude(client, registryB64, "registry"),
    ]);

    // Merge data
    const merged: JusetsuData = {
      ...defaultJusetsuData,
      ...contractData,
      ...registryData,
    };

    // Get hazard info if address is available
    if (merged.address) {
      const hazardData = await getHazardInfo(merged.address);
      Object.assign(merged, hazardData);
    }

    return NextResponse.json({ data: merged });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "抽出に失敗しました" },
      { status: 500 }
    );
  }
}
