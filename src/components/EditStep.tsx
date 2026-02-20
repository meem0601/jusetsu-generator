"use client";

import { JusetsuData } from "@/types/jusetsu";

interface Props {
  data: JusetsuData;
  onChange: (data: JusetsuData) => void;
  onGeneratePdf: () => void;
  onGenerateHazardPdf: () => void;
  generating: boolean;
  generatingHazard: boolean;
}

const sections = [
  {
    title: "🏠 物件の表示",
    fields: [
      { key: "propertyName", label: "物件名称" },
      { key: "address", label: "所在地" },
      { key: "roomNumber", label: "部屋番号" },
      { key: "layout", label: "間取り" },
      { key: "structure", label: "構造" },
      { key: "area", label: "専有面積" },
      { key: "builtDate", label: "築年月" },
      { key: "stories", label: "階建て数" },
      { key: "floor", label: "所在階" },
    ],
  },
  {
    title: "📋 登記簿に記載された事項",
    fields: [
      { key: "owner", label: "所有者（甲区）" },
      { key: "mortgage", label: "抵当権等（乙区）" },
    ],
  },
  {
    title: "⚖️ 法令上の制限",
    fields: [{ key: "zoning", label: "用途地域" }],
  },
  {
    title: "🔌 インフラ",
    fields: [
      { key: "water", label: "飲用水" },
      { key: "electricity", label: "電気" },
      { key: "gas", label: "ガス" },
      { key: "drainage", label: "排水" },
    ],
  },
  {
    title: "🏗️ 設備",
    fields: [
      { key: "kitchen", label: "台所" },
      { key: "bathroom", label: "浴室" },
      { key: "toilet", label: "トイレ" },
      { key: "aircon", label: "エアコン" },
      { key: "otherEquipment", label: "その他設備" },
    ],
  },
  {
    title: "💰 賃料等",
    fields: [
      { key: "rent", label: "賃料" },
      { key: "managementFee", label: "管理費・共益費" },
      { key: "deposit", label: "敷金" },
      { key: "keyMoney", label: "礼金" },
      { key: "otherFees", label: "その他費用" },
    ],
  },
  {
    title: "👤 借主情報",
    fields: [
      { key: "tenantName", label: "借主（乙）氏名" },
      { key: "tenantAddress", label: "借主住所" },
    ],
  },
  {
    title: "💳 支払い方法",
    fields: [
      { key: "paymentDeadline", label: "支払期限" },
      { key: "paymentMethod", label: "支払方法（振込先等）" },
    ],
  },
  {
    title: "📅 契約期間",
    fields: [
      { key: "contractStart", label: "開始日" },
      { key: "contractEnd", label: "終了日" },
      { key: "renewalCondition", label: "更新条件" },
    ],
  },
  {
    title: "🗺️ ハザードマップ",
    fields: [
      { key: "floodRisk", label: "洪水" },
      { key: "landslideRisk", label: "土砂災害" },
      { key: "tsunamiRisk", label: "津波" },
    ],
  },
  {
    title: "🏗️ 耐震・石綿",
    fields: [
      { key: "earthquakeResistance", label: "耐震診断" },
      { key: "asbestos", label: "石綿使用調査" },
    ],
  },
  {
    title: "📝 契約解除・違約金",
    fields: [
      { key: "cancellationTerms", label: "解約条件" },
      { key: "penalty", label: "違約金" },
    ],
  },
  {
    title: "⭐ 特約事項・その他",
    fields: [
      { key: "earlyTerminationPenalty", label: "短期解約違約金" },
      { key: "cleaningFee", label: "退去時クリーニング代" },
      { key: "keyChangeFee", label: "鍵交換費用" },
      { key: "noticePeriod", label: "解約予告期間" },
      { key: "rentProrationOnCancel", label: "解約時日割り計算" },
      { key: "petPolicy", label: "ペット可否" },
      { key: "instrumentPolicy", label: "楽器可否" },
      { key: "restorationObligation", label: "原状回復条件" },
      { key: "insuranceRequirement", label: "火災保険加入義務" },
      { key: "guarantorInfo", label: "連帯保証人条件" },
      { key: "parking", label: "駐車場・駐輪場" },
      { key: "internet", label: "インターネット環境" },
      { key: "prohibitedItems", label: "禁止事項" },
      { key: "keyCount", label: "貸与鍵の本数・種類" },
      { key: "renewalProcedure", label: "更新手続き方法" },
      { key: "otherSpecialTerms", label: "その他特約事項", textarea: true },
      { key: "managementCompany", label: "管理会社" },
      { key: "landlordName", label: "貸主" },
    ],
  },
  {
    title: "🏢 仲介業者",
    fields: [
      { key: "brokerName", label: "仲介業者名" },
      { key: "brokerLicense", label: "宅建業者免許番号" },
      { key: "tradingOfficerName", label: "宅地建物取引士" },
    ],
  },
] as const;

export default function EditStep({ data, onChange, onGeneratePdf, onGenerateHazardPdf, generating, generatingHazard }: Props) {
  const update = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        💡 AIが抽出した情報を確認・修正してください。修正後「PDF生成」ボタンで重説PDFをダウンロードできます。
      </div>

      {sections.map((section) => (
        <div
          key={section.title}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-base font-bold text-gray-900 mb-4">
            {section.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <div
                key={field.key}
                className={"textarea" in field && field.textarea ? "md:col-span-2" : ""}
              >
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {field.label}
                </label>
                {"textarea" in field && field.textarea ? (
                  <textarea
                    value={(data as unknown as Record<string, string>)[field.key] || ""}
                    onChange={(e) => update(field.key, e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={(data as unknown as Record<string, string>)[field.key] || ""}
                    onChange={(e) => update(field.key, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                )}
              </div>
            ))}
            {section.title === "🗺️ ハザードマップ" && (
              <>
                {data.floodMapImage && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">洪水ハザードマップ画像</label>
                    <img src={`data:image/png;base64,${data.floodMapImage}`} alt="洪水ハザードマップ" className="w-full rounded-lg border" />
                  </div>
                )}
                {data.landslideMapImage && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">土砂災害ハザードマップ画像</label>
                    <img src={`data:image/png;base64,${data.landslideMapImage}`} alt="土砂災害ハザードマップ" className="w-full rounded-lg border" />
                  </div>
                )}
                {data.tsunamiMapImage && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">津波ハザードマップ画像</label>
                    <img src={`data:image/png;base64,${data.tsunamiMapImage}`} alt="津波ハザードマップ" className="w-full rounded-lg border" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 space-y-2">
        <button
          onClick={onGeneratePdf}
          disabled={generating}
          className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? "⏳ PDF生成中..." : "📄 重説PDFを生成・ダウンロード"}
        </button>
        <button
          onClick={onGenerateHazardPdf}
          disabled={generatingHazard || (!data.floodMapImage && !data.landslideMapImage && !data.tsunamiMapImage)}
          className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generatingHazard ? "⏳ ハザードマップPDF生成中..." : "🗺️ ハザードマップPDFをダウンロード"}
        </button>
      </div>
    </div>
  );
}
