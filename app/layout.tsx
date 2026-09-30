import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momo Word Snap - 极速课本生词提取与卡片浏览",
  description: "基于 AI 视觉识别的极简个人语言学习卡片工具",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-stone-50 text-stone-900 min-h-screen selection:bg-stone-200">
        <main className="max-w-md mx-auto min-h-screen flex flex-col bg-white shadow-sm border-x border-stone-100 relative">
          {children}
        </main>
      </body>
    </html>
  );
}
