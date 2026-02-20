"use client";

import { useState, useMemo } from "react";
import { JusetsuData } from "@/types/jusetsu";

interface Props {
  data: JusetsuData;
  onChange: (data: JusetsuData) => void;
  onGeneratePdf: () => void;
  onGenerateHazardPdf: () => void;
  generating: boolean;
  generatingHazard: boolean;
  onBack: () => void;
}

export default function HazardMapStep({
  data,
  onChange,
  onGeneratePdf,
  onGenerateHazardPdf,
  generating,
  generatingHazard,
  onBack,
}: Props) {
  const [activeLayer, setActiveLayer] = useState<"flood" | "landslide" | "tsunami">("flood");

  const address = data.building?.addressDisplay || data.building?.addressRegistry || "";

  // disaportal URL - ユーザーが住所検索してハザードマップを確認できる
  const disaportalUrl = useMemo(() => {
    return `https://disaportal.gsi.go.jp/maps/index.html`;
  }, []);

  const layers = [
    { key: "flood" as const, label: "🌊 洪水", color: "blue" },
    { key: "landslide" as const, label: "⛰️ 土砂災害", color: "orange" },
    { key: "tsunami" as const, label: "🌊 津波", color: "red" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        🗺️ 重ねるハザードマップで物件のハザード情報を確認してください。
        <br />
        下のマップで住所を検索すると、洪水・土砂災害・津波のリスク情報が表示されます。
        <br />
        <strong>※ スクリーンショットを撮ってハザードマップPDFに添付できます。</strong>
      </div>

      {/* 対象住所 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-bold text-gray-900 mb-1">📍 対象住所</h3>
        <p className="text-sm text-gray-700">{address || "（住所未設定）"}</p>
        {address && (
          <p className="text-xs text-gray-500 mt-1">
            ↓ のマップの検索ボックスにこの住所をコピペして検索してください
          </p>
        )}
        {address && (
          <button
            onClick={() => navigator.clipboard.writeText(address)}
            className="mt-2 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            📋 住所をコピー
          </button>
        )}
      </div>

      {/* disaportal iframe */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">重ねるハザードマップ</h3>
          <a
            href={disaportalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            別タブで開く ↗
          </a>
        </div>
        <iframe
          src={disaportalUrl}
          className="w-full border-0"
          style={{ height: "600px" }}
          title="重ねるハザードマップ"
          allow="geolocation"
        />
      </div>

      {/* ハザード情報テキスト入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">📝 ハザード情報（重説に記載する内容）</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              洪水ハザードマップ
            </label>
            <div className="flex items-center gap-3 mb-2">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={data.hazardMap?.floodExists || false}
                  onChange={(e) => onChange({
                    ...data,
                    hazardMap: { ...data.hazardMap, floodExists: e.target.checked }
                  } as JusetsuData)}
                />
                有
              </label>
            </div>
            <input
              type="text"
              value={data.hazardMap?.floodDetail || ""}
              onChange={(e) => onChange({
                ...data,
                hazardMap: { ...data.hazardMap, floodDetail: e.target.value }
              } as JusetsuData)}
              placeholder="例: 浸水想定0.5〜3.0m"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              雨水出水（内水）ハザードマップ
            </label>
            <div className="flex items-center gap-3 mb-2">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={data.hazardMap?.stormWaterExists || false}
                  onChange={(e) => onChange({
                    ...data,
                    hazardMap: { ...data.hazardMap, stormWaterExists: e.target.checked }
                  } as JusetsuData)}
                />
                有
              </label>
            </div>
            <input
              type="text"
              value={data.hazardMap?.stormWaterDetail || ""}
              onChange={(e) => onChange({
                ...data,
                hazardMap: { ...data.hazardMap, stormWaterDetail: e.target.value }
              } as JusetsuData)}
              placeholder="例: 浸水想定区域外"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              高潮ハザードマップ
            </label>
            <div className="flex items-center gap-3 mb-2">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={data.hazardMap?.stormSurgeExists || false}
                  onChange={(e) => onChange({
                    ...data,
                    hazardMap: { ...data.hazardMap, stormSurgeExists: e.target.checked }
                  } as JusetsuData)}
                />
                有
              </label>
            </div>
            <input
              type="text"
              value={data.hazardMap?.stormSurgeDetail || ""}
              onChange={(e) => onChange({
                ...data,
                hazardMap: { ...data.hazardMap, stormSurgeDetail: e.target.value }
              } as JusetsuData)}
              placeholder="例: 浸水想定区域外"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* ハザードマップ画像アップロード */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-2">📸 ハザードマップ画像（任意）</h3>
        <p className="text-xs text-gray-500 mb-4">
          上のマップのスクリーンショットをアップロードすると、ハザードマップPDFに添付されます。
        </p>

        {["flood", "landslide", "tsunami"].map((type) => {
          const label = type === "flood" ? "洪水" : type === "landslide" ? "土砂災害" : "津波";
          const imageKey = `${type}MapImage` as keyof JusetsuData;
          const currentImage = data[imageKey] as string;

          return (
            <div key={type} className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {label}ハザードマップ画像
              </label>
              {currentImage ? (
                <div className="relative">
                  <img
                    src={currentImage.startsWith("data:") ? currentImage : `data:image/png;base64,${currentImage}`}
                    alt={`${label}ハザードマップ`}
                    className="w-full rounded-lg border max-h-64 object-contain"
                  />
                  <button
                    onClick={() => onChange({ ...data, [imageKey]: "" } as JusetsuData)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      onChange({ ...data, [imageKey]: reader.result as string } as JusetsuData);
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="text-sm"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ボタン */}
      <div className="sticky bottom-4 space-y-2">
        <button
          onClick={onGenerateHazardPdf}
          disabled={generatingHazard}
          className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generatingHazard ? "⏳ ハザードマップPDF生成中..." : "🗺️ ハザードマップPDFをダウンロード"}
        </button>
        <button
          onClick={onGeneratePdf}
          disabled={generating}
          className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? "⏳ PDF生成中..." : "📄 重説PDFを生成・ダウンロード"}
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"
        >
          ← 確認・編集に戻る
        </button>
      </div>
    </div>
  );
}
