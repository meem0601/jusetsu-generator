"use client";

import { useState } from "react";
import UploadStep from "@/components/UploadStep";
import ProcessingStep from "@/components/ProcessingStep";
import EditStep from "@/components/EditStep";
import { JusetsuData } from "@/types/jusetsu";

type Step = "upload" | "processing" | "edit";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [data, setData] = useState<JusetsuData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatingHazard, setGeneratingHazard] = useState(false);

  const handleUpload = async (contractFile: File, registryFile: File) => {
    setStep("processing");
    try {
      const formData = new FormData();
      formData.append("contract", contractFile);
      formData.append("registry", registryFile);

      const res = await fetch("/api/extract", { method: "POST", body: formData });
      if (!res.ok) throw new Error("抽出に失敗しました");
      const result = await res.json();
      setData(result.data);
      setStep("edit");
    } catch (e) {
      alert(e instanceof Error ? e.message : "エラーが発生しました");
      setStep("upload");
    }
  };

  const handleGeneratePdf = async () => {
    if (!data) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("PDF生成に失敗しました");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `重要事項説明書_${data.propertyName || "物件"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateHazardPdf = async () => {
    if (!data) return;
    setGeneratingHazard(true);
    try {
      const res = await fetch("/api/generate-hazard-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: data.address,
          floodMapImage: data.floodMapImage,
          landslideMapImage: data.landslideMapImage,
          tsunamiMapImage: data.tsunamiMapImage,
          floodRisk: data.floodRisk,
          landslideRisk: data.landslideRisk,
          tsunamiRisk: data.tsunamiRisk,
        }),
      });
      if (!res.ok) throw new Error("ハザードマップPDF生成に失敗しました");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ハザードマップ_${data.propertyName || "物件"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setGeneratingHazard(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-blue-600 text-white rounded-lg p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">重説自動作成ツール</h1>
            <p className="text-sm text-gray-500">賃貸仲介の重要事項説明書を自動生成</p>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-8">
          {[
            { key: "upload", label: "① アップロード" },
            { key: "processing", label: "② AI解析中" },
            { key: "edit", label: "③ 確認・編集" },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-0.5 bg-gray-300" />}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  step === s.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {step === "upload" && <UploadStep onUpload={handleUpload} />}
        {step === "processing" && <ProcessingStep />}
        {step === "edit" && data && (
          <EditStep
            data={data}
            onChange={setData}
            onGeneratePdf={handleGeneratePdf}
            onGenerateHazardPdf={handleGenerateHazardPdf}
            generating={generating}
            generatingHazard={generatingHazard}
          />
        )}
      </div>
    </div>
  );
}
