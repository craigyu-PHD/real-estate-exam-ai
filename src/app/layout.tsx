import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "不動產經紀人 AI 法規家教",
  description: "從零開始的不動產經紀人 AI 法規學習系統",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0f172a",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-200 min-h-screen`}>
        <Navigation />
        <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
