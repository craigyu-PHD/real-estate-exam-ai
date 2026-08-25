import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { SettingsProvider } from "@/components/SettingsProvider";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "不動產經紀人 AI 學習系統｜補習班級",
  description: "白底企業級・零基礎到考上的 AI 家教，周周進度、逐條精講、聽課連播",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${notoSansTC.variable} ${notoSerifTC.variable} antialiased text-base`}
      >
        <SettingsProvider>
          <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#f8fafc]">
            <div className="absolute -top-32 -left-20 w-[60%] h-[45%] bg-indigo-500/10 blur-[80px] rounded-full animate-float pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-[55%] h-[50%] bg-amber-500/10 blur-[90px] rounded-full animate-float-delayed pointer-events-none" />
          </div>
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 md:ml-64 relative">
              {children}
            </main>
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
