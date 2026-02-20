"use client";

import { useState } from "react";
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
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasImages = !!(data.floodMapImage || data.landslideMapImage || data.tsunamiMapImage);

  const handleFetchHazardMap = async () => {
    if (!data.address) {
      setError("住所が設定されていません。前のステップで住所を入力してください。");
      return;
    }
    setFetching(true);
    setError(null);
    try {
      const res = await fetch("/api/hazard-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: data.address }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "取得に失敗しました");
      }
      const result = await res.json();
      onChange({
        ...data,
        floodMapImage: result.flood || "",
        landslideMapImage: result.landslide || "",
        tsunamiMapImage: result.tsunami || "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        🗺️ disaportal（重ねるハザードマップ）から自動でスクリーンショットを取得します。
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-2">対象住所</h3>
        <p className="text-sm text-gray-700 mb-4">{data.address || "（住所未設定）"}</p>

        <button
          onClick={handleFetchHazardMap}
          disabled={fetching || !data.address}
          className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {fetching ? "🔄 disaportalからハザードマップを取得中...（約60秒）" : "🗺️ ハザードマップを取得"}
        </button>

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}
      </div>

      {hasImages && (
        <>
          {data.floodMapImage && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-2">洪水浸水想定区域図（想定最大規模）</h3>
              <img
                src={`data:image/png;base64,${data.floodMapImage}`}
                alt="洪水浸水想定区域図"
                className="w-full rounded-lg border"
              />
            </div>
          )}
          {data.landslideMapImage && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-2">土砂災害警戒区域図</h3>
              <img
                src={`data:image/png;base64,${data.landslideMapImage}`}
                alt="土砂災害警戒区域図"
                className="w-full rounded-lg border"
              />
            </div>
          )}
          {data.tsunamiMapImage && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-2">津波浸水想定区域図</h3>
              <img
                src={`data:image/png;base64,${data.tsunamiMapImage}`}
                alt="津波浸水想定区域図"
                className="w-full rounded-lg border"
              />
            </div>
          )}
        </>
      )}

      <div className="sticky bottom-4 space-y-2">
        <button
          onClick={onGenerateHazardPdf}
          disabled={generatingHazard || !hasImages}
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
