import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "三笠館 軒先販売管理",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-green-600 text-white px-4 py-3 shadow">
          <a href="/" className="text-lg font-bold">🏠 三笠館 軒先販売管理</a>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
