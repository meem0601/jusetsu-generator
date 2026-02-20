import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { defaultJusetsuData, JusetsuData } from "@/types/jusetsu";

export const maxDuration = 120;

async function extractWithClaude(
  client: Anthropic,
  pdfBase64: string,
  docType: "contract" | "registry"
): Promise<Record<string, unknown>> {
  const contractPrompt = `この賃貸借契約書PDFから以下のJSON構造で情報を抽出してください。
値が見つからない場合はデフォルト値（文字列なら""、数値なら0、booleanならfalse）にしてください。

{
  "borrowerName": "借主の氏名",
  "lenderName": "貸主の名前（法人名含む）",
  "transactionType": "媒介 or 代理",
  "broker1": {
    "licenseNumber": "免許証番号（例: 国土交通大臣(1)第10916号）",
    "officeAddress": "事務所所在地",
    "phone": "電話番号",
    "companyName": "商号または名称",
    "representative": "代表者名"
  },
  "tradingOfficer1": {
    "registrationNumber": "登録番号",
    "name": "氏名",
    "officeName": "事務所名",
    "officeAddress": "事務所所在地",
    "phone": "電話番号"
  },
  "guaranteeAssociation": {
    "name": "保証協会名",
    "address": "保証協会住所",
    "localBranch": "地方本部名称",
    "localBranchAddress": "地方本部所在地",
    "depositOffice": "供託所名",
    "depositOfficeAddress": "供託所所在地"
  },
  "building": {
    "name": "建物名称（マンション名等）",
    "addressDisplay": "住居表示の住所",
    "addressRegistry": "登記簿上の所在地",
    "type": "マンション/アパート/戸建/テラスハウス のいずれか",
    "structure": "構造（鉄筋コンクリート造等）",
    "floorArea": "床面積（約52.72㎡ 等）",
    "layout": "間取り（1LDK等）",
    "builtDate": "建築時期"
  },
  "landlord": {
    "sameAsOwner": true,
    "address": "貸主住所",
    "name": "貸主名",
    "remarks": ""
  },
  "infrastructure": {
    "water": { "available": true, "provider": "公営水道等", "remarks": "" },
    "electricity": { "available": true, "provider": "電力会社名", "remarks": "" },
    "gas": { "available": true, "type": "都市ガス/プロパン", "provider": "", "remarks": "" },
    "drainage": { "available": true, "type": "公共下水等", "remarks": "" }
  },
  "equipment": {
    "electricity": { "exists": true, "detail": "" },
    "gas": { "exists": true, "detail": "" },
    "stove": { "exists": false, "detail": "" },
    "waterSupply": { "exists": true, "detail": "" },
    "sewage": { "exists": true, "detail": "" },
    "kitchen": { "exists": true, "detail": "" },
    "toilet": { "exists": true, "detail": "" },
    "bathroom": { "exists": true, "detail": "" },
    "washstand": { "exists": true, "detail": "" },
    "laundry": { "exists": true, "detail": "" },
    "hotWater": { "exists": true, "detail": "" },
    "aircon": { "exists": false, "detail": "" },
    "lighting": { "exists": false, "detail": "" },
    "furniture": { "exists": false, "detail": "" },
    "digitalTV": { "exists": false, "detail": "" },
    "catv": { "exists": false, "detail": "" },
    "internet": { "exists": false, "detail": "" },
    "trunkRoom": { "exists": false, "detail": "" },
    "garden": { "exists": false, "detail": "" },
    "roofBalcony": { "exists": false, "detail": "" },
    "keys": { "exists": true, "detail": "鍵番号・本数" }
  },
  "commonFacilities": {
    "elevator": { "exists": false, "detail": "" },
    "autoLock": { "exists": false, "detail": "" },
    "mailbox": { "exists": false, "detail": "" },
    "deliveryBox": { "exists": false, "detail": "" },
    "trunkRoom": { "exists": false, "detail": "" },
    "parking": { "exists": false, "detail": "" },
    "bicycle": { "exists": false, "detail": "" },
    "bikeParking": { "exists": false, "detail": "" }
  },
  "financials": {
    "rent": 0,
    "managementFee": 0,
    "deposit": 0,
    "keyMoney": 0,
    "otherFees": [{"name": "費用名", "amount": "金額"}],
    "paymentDeadline": "翌月分を毎月27日までに等",
    "paymentMethod": "振込等",
    "bankInfo": "銀行名 支店名 口座番号"
  },
  "cancellation": "契約解除条件の全文",
  "penalty": {
    "exists": false,
    "detail": "違約金の詳細"
  },
  "securityMeasure": {
    "provided": false,
    "detail": ""
  },
  "contract": {
    "type": "普通賃貸借",
    "startDate": "契約開始日（西暦）",
    "endDate": "契約終了日（西暦）",
    "periodYears": 2,
    "renewalTerms": "更新条件",
    "renewalFee": "更新料",
    "renewalAdminFee": "更新事務手数料"
  },
  "usageRestrictions": {
    "purpose": "居住用",
    "petPolicy": "ペット可否・条件",
    "instrumentPolicy": "楽器可否",
    "renovationPolicy": "リフォーム可否",
    "other": ""
  },
  "depositSettlement": "敷金精算条件",
  "management": {
    "buildingManager": { "name": "", "address": "", "phone": "", "person": "", "registrationNumber": "" },
    "propertyManager": { "name": "", "address": "", "phone": "", "person": "", "registrationNumber": "" }
  },
  "otherImportantMatters": "その他重要事項",
  "remarks": "備考"
}

**注意:**
- 金額はカンマなしの数値で返す（rent, managementFee, deposit, keyMoney）
- 令和・平成の日付は西暦に変換
- 契約書の全ページ（裏面・別紙・特約条項含む）から情報を探す
- 特約事項はotherImportantMattersまたは各該当フィールドに振り分ける

JSONのみ返してください。`;

  const registryPrompt = `この登記簿謄本PDFから以下のJSON構造で情報を抽出してください。
値が見つからない場合は空文字""またはfalseにしてください。

{
  "registry": {
    "ownerAddress": "所有者住所（甲区）",
    "ownerName": "所有者氏名/法人名（甲区）",
    "ownershipRights": false,
    "ownershipRightsDetail": "所有権にかかる権利の詳細（差押え等あれば）",
    "otherRights": false,
    "otherRightsDetail": "乙区記載の抵当権・根抵当権等の詳細"
  },
  "building": {
    "addressRegistry": "登記簿上の所在地",
    "structure": "構造",
    "floorArea": "床面積"
  }
}

JSONのみ返してください。`;

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
          },
          { type: "text", text: docType === "contract" ? contractPrompt : registryPrompt },
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

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key]) && target[key] && typeof target[key] === "object" && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else if (source[key] !== "" && source[key] !== undefined && source[key] !== null) {
      result[key] = source[key];
    }
  }
  return result;
}

async function getHazardInfo(address: string): Promise<Partial<JusetsuData>> {
  try {
    const geoRes = await fetch(
      `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`
    );
    const geoData = await geoRes.json();
    if (!geoData || geoData.length === 0) return {};

    const [lon, lat] = geoData[0].geometry.coordinates;
    const results: Partial<JusetsuData> = {};

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
    return {};
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

    const [contractB64, registryB64] = await Promise.all([
      contractFile.arrayBuffer().then((b) => Buffer.from(b).toString("base64")),
      registryFile.arrayBuffer().then((b) => Buffer.from(b).toString("base64")),
    ]);

    const [contractData, registryData] = await Promise.all([
      extractWithClaude(client, contractB64, "contract"),
      extractWithClaude(client, registryB64, "registry"),
    ]);

    // Deep merge: defaults -> contract -> registry
    const merged = deepMerge(
      deepMerge(defaultJusetsuData as unknown as Record<string, unknown>, contractData),
      registryData
    ) as unknown as JusetsuData;

    // Get hazard info if address is available
    const address = merged.building?.addressDisplay || merged.building?.addressRegistry;
    if (address) {
      const hazardData = await getHazardInfo(address);
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
