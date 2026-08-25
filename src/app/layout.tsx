import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { SettingsProvider } from "@/components/SettingsProvider";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "不動產經紀人 AI 學習系統",
  description: "結合 PWA 與 AI 的隨身法規家教",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="dark">
      <body
        className={`${notoSansTC.variable} ${notoSerifTC.variable} antialiased text-base selection:bg-blue-500/30 selection:text-blue-200`}
      >
        <SettingsProvider>
          {/* Animated Background */}
          <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-950">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full animate-float pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/20 blur-[150px] rounded-full animate-float-delayed pointer-events-none"></div>
          </div>
          
          <div className="flex h-screen overflow-hidden">
            <Navigation />
            <main className="flex-1 overflow-y-auto md:ml-64 relative">
              {children}
            </main>
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
