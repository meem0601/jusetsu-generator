"use client";

export default function ProcessingStep() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center space-y-6">
        <div className="inline-flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">AI解析中...</h2>
          <p className="text-sm text-gray-500 mt-2">
            PDFを画像に変換し、Claude Vision APIで情報を抽出しています。
            <br />
            しばらくお待ちください（30秒〜1分程度）
          </p>
        </div>
        <div className="space-y-2 text-left max-w-sm mx-auto">
          {["PDF→画像変換", "契約書の情報抽出", "登記簿の情報抽出", "ハザードマップ情報取得"].map(
            (s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-pulse w-2 h-2 rounded-full bg-blue-500" />
                {s}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
