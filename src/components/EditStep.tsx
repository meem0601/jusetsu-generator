"use client";

import { JusetsuData, EquipmentItem } from "@/types/jusetsu";

interface Props {
  data: JusetsuData;
  onChange: (data: JusetsuData) => void;
  onGeneratePdf: () => void;
  onGenerateHazardPdf: () => void;
  generating: boolean;
  generatingHazard: boolean;
  onNext?: () => void;
}

export default function EditStep({ data, onChange, onGeneratePdf, onGenerateHazardPdf, generating, generatingHazard, onNext }: Props) {
  // Helper to update nested paths
  const updateField = (path: string, value: unknown) => {
    const keys = path.split(".");
    const newData = JSON.parse(JSON.stringify(data));
    let obj = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  const getField = (path: string): unknown => {
    const keys = path.split(".");
    let obj: unknown = data;
    for (const key of keys) {
      if (obj && typeof obj === "object") {
        obj = (obj as Record<string, unknown>)[key];
      } else {
        return "";
      }
    }
    return obj ?? "";
  };

  const renderInput = (label: string, path: string, opts?: { textarea?: boolean; type?: string }) => (
    <div className={opts?.textarea ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      {opts?.textarea ? (
        <textarea
          value={String(getField(path) || "")}
          onChange={(e) => updateField(path, e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      ) : (
        <input
          type={opts?.type || "text"}
          value={String(getField(path) || "")}
          onChange={(e) => updateField(path, opts?.type === "number" ? Number(e.target.value) : e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      )}
    </div>
  );

  const renderCheckbox = (label: string, path: string) => (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={!!getField(path)}
        onChange={(e) => updateField(path, e.target.checked)}
        className="rounded border-gray-300"
      />
      <label className="text-sm text-gray-700">{label}</label>
    </div>
  );

  const renderEquipmentRow = (label: string, basePath: string) => (
    <div className="flex items-center gap-3 py-1 border-b border-gray-100">
      <input
        type="checkbox"
        checked={!!(getField(`${basePath}.exists`) as boolean)}
        onChange={(e) => updateField(`${basePath}.exists`, e.target.checked)}
        className="rounded border-gray-300"
      />
      <span className="text-sm w-28 shrink-0">{label}</span>
      <input
        type="text"
        value={String(getField(`${basePath}.detail`) || "")}
        onChange={(e) => updateField(`${basePath}.detail`, e.target.value)}
        placeholder="詳細"
        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
      />
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-base font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        💡 AIが抽出した情報を確認・修正してください。修正後「PDF生成」ボタンで重説PDFをダウンロードできます。
      </div>

      {/* 当事者 */}
      <Section title="👥 当事者・取引態様">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("借主", "borrowerName")}
          {renderInput("貸主", "lenderName")}
          {renderInput("取引態様", "transactionType")}
        </div>
      </Section>

      {/* 宅地建物取引業者 */}
      <Section title="🏢 宅地建物取引業者（1）">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("免許証番号", "broker1.licenseNumber")}
          {renderInput("商号", "broker1.companyName")}
          {renderInput("事務所所在地", "broker1.officeAddress")}
          {renderInput("電話番号", "broker1.phone")}
          {renderInput("代表者", "broker1.representative")}
        </div>
      </Section>

      <Section title="🏢 宅地建物取引業者（2）">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("免許証番号", "broker2.licenseNumber")}
          {renderInput("商号", "broker2.companyName")}
          {renderInput("事務所所在地", "broker2.officeAddress")}
          {renderInput("電話番号", "broker2.phone")}
          {renderInput("代表者", "broker2.representative")}
        </div>
      </Section>

      {/* 取引士 */}
      <Section title="📋 宅地建物取引士（1）">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("登録番号", "tradingOfficer1.registrationNumber")}
          {renderInput("氏名", "tradingOfficer1.name")}
          {renderInput("事務所名", "tradingOfficer1.officeName")}
          {renderInput("事務所所在地", "tradingOfficer1.officeAddress")}
          {renderInput("電話番号", "tradingOfficer1.phone")}
        </div>
      </Section>

      <Section title="📋 宅地建物取引士（2）">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("登録番号", "tradingOfficer2.registrationNumber")}
          {renderInput("氏名", "tradingOfficer2.name")}
          {renderInput("事務所名", "tradingOfficer2.officeName")}
          {renderInput("事務所所在地", "tradingOfficer2.officeAddress")}
          {renderInput("電話番号", "tradingOfficer2.phone")}
        </div>
      </Section>

      {/* 保証協会 */}
      <Section title="🛡️ 保証協会">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("名称", "guaranteeAssociation.name")}
          {renderInput("所在地", "guaranteeAssociation.address")}
          {renderInput("地方本部名称", "guaranteeAssociation.localBranch")}
          {renderInput("地方本部所在地", "guaranteeAssociation.localBranchAddress")}
          {renderInput("供託所", "guaranteeAssociation.depositOffice")}
          {renderInput("供託所所在地", "guaranteeAssociation.depositOfficeAddress")}
        </div>
      </Section>

      {/* A. 建物の表示 */}
      <Section title="🏠 A. 建物の表示">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("建物名称", "building.name")}
          {renderInput("住居表示", "building.addressDisplay")}
          {renderInput("登記簿上の所在地", "building.addressRegistry")}
          {renderInput("種類", "building.type")}
          {renderInput("構造", "building.structure")}
          {renderInput("床面積", "building.floorArea")}
          {renderInput("間取り", "building.layout")}
          {renderInput("建築時期", "building.builtDate")}
        </div>
      </Section>

      {/* B. 貸主の表示 */}
      <Section title="👤 B. 貸主の表示">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderCheckbox("登記簿記載の所有者と同じ", "landlord.sameAsOwner")}
          {renderInput("住所", "landlord.address")}
          {renderInput("氏名", "landlord.name")}
          {renderInput("備考", "landlord.remarks")}
        </div>
      </Section>

      {/* Ⅰ-1. 登記記録 */}
      <Section title="📑 Ⅰ-1. 登記記録に記録された事項">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("所有者住所", "registry.ownerAddress")}
          {renderInput("所有者氏名", "registry.ownerName")}
          {renderCheckbox("所有権にかかる権利あり", "registry.ownershipRights")}
          {renderInput("権利詳細", "registry.ownershipRightsDetail")}
          {renderCheckbox("所有権以外の権利あり", "registry.otherRights")}
          {renderInput("抵当権等の詳細", "registry.otherRightsDetail")}
        </div>
      </Section>

      {/* Ⅰ-2. 法令制限 */}
      <Section title="⚖️ Ⅰ-2. 法令に基づく制限">
        <div className="grid grid-cols-1 gap-4">
          {renderInput("法令制限の概要", "legalRestrictions", { textarea: true })}
        </div>
      </Section>

      {/* Ⅰ-3. インフラ */}
      <Section title="🔌 Ⅰ-3. インフラ">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderCheckbox("水道あり", "infrastructure.water.available")}
            {renderInput("供給元", "infrastructure.water.provider")}
            {renderInput("備考", "infrastructure.water.remarks")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderCheckbox("電気あり", "infrastructure.electricity.available")}
            {renderInput("供給元", "infrastructure.electricity.provider")}
            {renderInput("備考", "infrastructure.electricity.remarks")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderCheckbox("ガスあり", "infrastructure.gas.available")}
            {renderInput("種類", "infrastructure.gas.type")}
            {renderInput("供給元", "infrastructure.gas.provider")}
            {renderInput("備考", "infrastructure.gas.remarks")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderCheckbox("排水あり", "infrastructure.drainage.available")}
            {renderInput("種類", "infrastructure.drainage.type")}
            {renderInput("備考", "infrastructure.drainage.remarks")}
          </div>
        </div>
      </Section>

      {/* Ⅰ-6. 設備 */}
      <Section title="🔧 Ⅰ-6. 設備の整備状況">
        <div className="space-y-1">
          {(Object.entries({
            electricity: "1. 電気", gas: "2. ガス", stove: "3. コンロ",
            waterSupply: "4. 上水道", sewage: "5. 下水道", kitchen: "6. 台所",
            toilet: "7. トイレ", bathroom: "8. 浴室", washstand: "9. 洗面台",
            laundry: "10. 洗濯機置場", hotWater: "11. 給湯設備", aircon: "12. 冷暖房",
            lighting: "13. 照明器具", furniture: "14. 備付家具", digitalTV: "15. 地デジ",
            catv: "16. CATV", internet: "17. インターネット", trunkRoom: "18. トランクルーム",
            garden: "19. 専用庭", roofBalcony: "20. ルーフバルコニー", keys: "21. 鍵",
          }) as [string, string][]).map(([key, label]) =>
            renderEquipmentRow(label, `equipment.${key}`)
          )}
        </div>
      </Section>

      {/* 共用設備 */}
      <Section title="🏗️ 共用設備">
        <div className="space-y-1">
          {(Object.entries({
            elevator: "エレベーター", autoLock: "オートロック", mailbox: "メールボックス",
            deliveryBox: "宅配ボックス", trunkRoom: "トランクルーム", parking: "駐車場",
            bicycle: "駐輪場", bikeParking: "バイク置場",
          }) as [string, string][]).map(([key, label]) =>
            renderEquipmentRow(label, `commonFacilities.${key}`)
          )}
        </div>
      </Section>

      {/* 防災区域 */}
      <Section title="⚠️ Ⅰ-7〜9. 防災区域">
        <div className="space-y-2">
          {renderCheckbox("造成宅地防災区域内", "hazardZones.developedLandDisasterZone")}
          {renderCheckbox("土砂災害警戒区域内", "hazardZones.landslideWarningZone")}
          {renderCheckbox("土砂災害特別警戒区域内", "hazardZones.landslideSpecialZone")}
          {renderCheckbox("津波災害警戒区域内", "hazardZones.tsunamiWarningZone")}
          {renderCheckbox("津波災害特別警戒区域内", "hazardZones.tsunamiSpecialZone")}
        </div>
      </Section>

      {/* ハザードマップ */}
      <Section title="🗺️ Ⅰ-10. ハザードマップ">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderCheckbox("洪水ハザードマップあり", "hazardMap.floodExists")}
            {renderInput("洪水詳細", "hazardMap.floodDetail")}
            {renderCheckbox("雨水出水ハザードマップあり", "hazardMap.stormWaterExists")}
            {renderInput("雨水出水詳細", "hazardMap.stormWaterDetail")}
            {renderCheckbox("高潮ハザードマップあり", "hazardMap.stormSurgeExists")}
            {renderInput("高潮詳細", "hazardMap.stormSurgeDetail")}
          </div>
          {data.floodMapImage && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">洪水ハザードマップ画像</label>
              <img src={`data:image/png;base64,${data.floodMapImage}`} alt="洪水" className="w-full rounded-lg border" />
            </div>
          )}
          {data.landslideMapImage && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">土砂災害ハザードマップ画像</label>
              <img src={`data:image/png;base64,${data.landslideMapImage}`} alt="土砂災害" className="w-full rounded-lg border" />
            </div>
          )}
          {data.tsunamiMapImage && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">津波ハザードマップ画像</label>
              <img src={`data:image/png;base64,${data.tsunamiMapImage}`} alt="津波" className="w-full rounded-lg border" />
            </div>
          )}
        </div>
      </Section>

      {/* 石綿・耐震 */}
      <Section title="🧱 Ⅰ-11〜12. 石綿・耐震">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("石綿照会先", "asbestos.inquiryTarget")}
          {renderCheckbox("石綿調査記録あり", "asbestos.recordExists")}
          {renderInput("石綿調査詳細", "asbestos.detail")}
          {renderCheckbox("耐震診断該当", "earthquake.applicable")}
          {renderCheckbox("耐震診断あり", "earthquake.diagnosisExists")}
          {renderInput("耐震診断詳細", "earthquake.detail")}
        </div>
      </Section>

      {/* Ⅱ-1. 賃料・費用 */}
      <Section title="💰 Ⅱ-1. 賃料・費用">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("賃料（円）", "financials.rent", { type: "number" })}
          {renderInput("管理費（円）", "financials.managementFee", { type: "number" })}
          {renderInput("敷金（円）", "financials.deposit", { type: "number" })}
          {renderInput("礼金（円）", "financials.keyMoney", { type: "number" })}
          {renderInput("支払期限", "financials.paymentDeadline")}
          {renderInput("支払方法", "financials.paymentMethod")}
          {renderInput("振込先", "financials.bankInfo", { textarea: true })}
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">その他費用</h4>
          {(data.financials.otherFees || []).map((fee, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={fee.name}
                onChange={(e) => {
                  const fees = [...data.financials.otherFees];
                  fees[i] = { ...fees[i], name: e.target.value };
                  updateField("financials.otherFees", fees);
                }}
                placeholder="費用名"
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
              />
              <input
                type="text"
                value={fee.amount}
                onChange={(e) => {
                  const fees = [...data.financials.otherFees];
                  fees[i] = { ...fees[i], amount: e.target.value };
                  updateField("financials.otherFees", fees);
                }}
                placeholder="金額"
                className="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
              />
              <button
                onClick={() => {
                  const fees = data.financials.otherFees.filter((_, j) => j !== i);
                  updateField("financials.otherFees", fees);
                }}
                className="text-red-500 text-sm px-2 cursor-pointer"
              >×</button>
            </div>
          ))}
          <button
            onClick={() => updateField("financials.otherFees", [...(data.financials.otherFees || []), { name: "", amount: "" }])}
            className="text-blue-600 text-sm cursor-pointer"
          >＋ 費用を追加</button>
        </div>
      </Section>

      {/* Ⅱ-2〜4 */}
      <Section title="📝 Ⅱ-2〜4. 契約解除・違約金・保全措置">
        <div className="grid grid-cols-1 gap-4">
          {renderInput("契約解除条件", "cancellation", { textarea: true })}
          {renderCheckbox("違約金の定めあり", "penalty.exists")}
          {renderInput("違約金詳細", "penalty.detail", { textarea: true })}
          {renderCheckbox("保全措置あり", "securityMeasure.provided")}
          {renderInput("保全措置詳細", "securityMeasure.detail")}
        </div>
      </Section>

      {/* Ⅱ-5. 契約期間 */}
      <Section title="📅 Ⅱ-5. 契約期間・更新">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("契約種別", "contract.type")}
          {renderInput("開始日", "contract.startDate")}
          {renderInput("終了日", "contract.endDate")}
          {renderInput("期間（年）", "contract.periodYears", { type: "number" })}
          {renderInput("更新条件", "contract.renewalTerms")}
          {renderInput("更新料", "contract.renewalFee")}
          {renderInput("更新事務手数料", "contract.renewalAdminFee")}
        </div>
      </Section>

      {/* Ⅱ-6. 用途制限 */}
      <Section title="🏷️ Ⅱ-6. 用途制限">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("使用目的", "usageRestrictions.purpose")}
          {renderInput("ペット可否", "usageRestrictions.petPolicy")}
          {renderInput("楽器可否", "usageRestrictions.instrumentPolicy")}
          {renderInput("リフォーム可否", "usageRestrictions.renovationPolicy")}
          {renderInput("その他", "usageRestrictions.other")}
        </div>
      </Section>

      {/* Ⅱ-7. 敷金精算 */}
      <Section title="💴 Ⅱ-7. 敷金精算">
        {renderInput("敷金精算条件", "depositSettlement", { textarea: true })}
      </Section>

      {/* Ⅱ-8. 管理委託先 */}
      <Section title="🏢 Ⅱ-8. 管理委託先">
        <h4 className="text-sm font-medium text-gray-700 mb-2">建物管理</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {renderInput("名称", "management.buildingManager.name")}
          {renderInput("住所", "management.buildingManager.address")}
          {renderInput("電話", "management.buildingManager.phone")}
          {renderInput("担当者", "management.buildingManager.person")}
          {renderInput("登録番号", "management.buildingManager.registrationNumber")}
        </div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">賃貸管理</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("名称", "management.propertyManager.name")}
          {renderInput("住所", "management.propertyManager.address")}
          {renderInput("電話", "management.propertyManager.phone")}
          {renderInput("担当者", "management.propertyManager.person")}
          {renderInput("登録番号", "management.propertyManager.registrationNumber")}
        </div>
      </Section>

      {/* Ⅲ〜Ⅴ */}
      <Section title="📋 Ⅲ〜Ⅴ. その他・添付・備考">
        <div className="grid grid-cols-1 gap-4">
          {renderInput("その他重要な事項", "otherImportantMatters", { textarea: true })}
          {renderInput("備考", "remarks", { textarea: true })}
        </div>
      </Section>

      <div className="sticky bottom-4 space-y-2">
        {onNext && (
          <button
            onClick={onNext}
            className="w-full py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg cursor-pointer"
          >
            次へ → ハザードマップ取得
          </button>
        )}
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
