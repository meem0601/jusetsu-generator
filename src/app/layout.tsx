import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "重説自動作成ツール",
  description: "賃貸仲介の重要事項説明書を自動生成",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
