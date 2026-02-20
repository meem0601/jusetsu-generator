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

**絶対に守ること:**
- このPDFから読み取れる情報のみを返してください
- 推測や一般的な知識で値を埋めないでください
- 情報が見つからない場合は必ず空文字""にしてください
- 電気・ガス・水道等のインフラ情報は、明示的に記載がある場合のみ値を入れてください
- 宅建業者・取引士の情報は契約書に「仲介」「媒介」として記載されている業者のみを抽出してください
- 保証協会情報は契約書には通常記載されないため、空にしてください
- 設備情報（エアコン、照明等）は契約書に明記されている場合のみtrueにしてください

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
  "otherImportantMatters": "特約事項・特約条項・特記事項の全文をここに入れる（改行は\\nで）",
  "remarks": "備考"
}

**注意:**
- 金額はカンマなしの数値で返す（rent, managementFee, deposit, keyMoney）
- 令和・平成の日付は西暦に変換
- 契約書の全ページ（裏面・別紙・特約条項含む）から情報を探す

**【特約事項の抽出について - 最重要】**
- 契約書内の「特約条項」「特約事項」「特記事項」「追加条件」「その他の条件」等のセクションを必ず探すこと
- 見つかった場合、その全文（箇条書き含む）を otherImportantMatters にそのまま転記すること
- 以下のような典型的な特約を見逃さないこと:
  - 退去時の原状回復に関する特約（クリーニング費用負担等）
  - 短期解約違約金（1年未満解約で賃料1ヶ月分等）
  - ペット飼育に関する条件・追加敷金
  - 火災保険・家財保険の加入義務
  - 鍵交換費用の負担
  - 更新料・更新事務手数料
  - 保証会社加入義務
  - 駐車場・駐輪場の利用条件
  - 騒音・生活マナーに関する規定
  - 連帯保証人の極度額
- 特約が見つからない場合は空文字""にすること（推測で書かない）

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
    
    // Set hazard map info based on geocoding success
    // The actual map images will be fetched on-demand from the edit screen
    const results: Partial<JusetsuData> = {
      hazardMap: {
        floodExists: true,
        floodDetail: `対象地点（${lat.toFixed(4)}, ${lon.toFixed(4)}）のハザードマップを確認してください`,
        stormWaterExists: false,
        stormWaterDetail: "",
        stormSurgeExists: false,
        stormSurgeDetail: "",
      },
    };

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
