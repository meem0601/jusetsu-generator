import { NextResponse } from "next/server";

// Puppeteer方式は廃止。フロントエンドでiframe + 手動スクショアップロード方式に変更。
export async function POST() {
  return NextResponse.json(
    { error: "この機能は廃止されました。ハザードマップ画面から直接スクリーンショットをアップロードしてください。" },
    { status: 410 }
  );
}
