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
  "propertyName": "物件名称",
  "address": "所在地（住所）",
  "roomNumber": "部屋番号",
  "layout": "間取り（1LDK等）",
  "structure": "構造（RC造等）",
  "area": "専有面積（㎡）",
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
  "rent": "賃料（月額）",
  "managementFee": "管理費・共益費",
  "deposit": "敷金",
  "keyMoney": "礼金",
  "otherFees": "その他費用（仲介手数料、保証料等）",
  "contractStart": "契約開始日",
  "contractEnd": "契約終了日",
  "renewalCondition": "更新条件",
  "earthquakeResistance": "耐震診断の有無と結果",
  "asbestos": "石綿使用調査の有無と結果",
  "cancellationTerms": "解約条件（解約予告期間等）",
  "penalty": "違約金",
  "specialTerms": "特約事項（原状回復、クリーニング費用等の特約を全て記載）",
  "managementCompany": "管理会社名",
  "landlordName": "貸主（甲）の名前"
}

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

    // Simple heuristic based on location
    // In production, use proper tile-based hazard map lookup
    results.floodRisk = `緯度${lat.toFixed(4)}, 経度${lon.toFixed(4)}付近。市区町村のハザードマップで要確認。`;
    results.landslideRisk = "市区町村のハザードマップで要確認。";
    results.tsunamiRisk = "市区町村のハザードマップで要確認。";

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
