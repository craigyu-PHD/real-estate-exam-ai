import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { SettingsProvider } from "@/components/SettingsProvider";
import { ThemeEffects } from "@/components/ThemeEffects";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  themeColor: "#0B0F17",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "不動產法規 AI｜Real Estate Exam Intelligence",
  description: "專業備考工作台、AI 法規助手與個人知識系統",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.variable} ${notoSansTC.variable} ${notoSerifTC.variable} antialiased`}>
        <SettingsProvider>
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 min-w-0 md:ml-[248px] relative px-0">
              {children}
            </main>
            <ThemeEffects />
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
