import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { SettingsProvider } from "@/components/SettingsProvider";
import { ThemeEffects } from "@/components/ThemeEffects";

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
  description: "零基礎到考上的 AI 家教，法規逐條精講、SM2 複習、聽課連播",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={`${notoSansTC.variable} ${notoSerifTC.variable} antialiased`}>
        <SettingsProvider>
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 md:ml-[280px] relative px-0">
              {children}
            </main>
            <ThemeEffects />
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
