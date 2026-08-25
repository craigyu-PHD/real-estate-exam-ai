# 不動產經紀人 AI 法規學習系統 (V1)

這是一個基於 Next.js 建立的「不動產經紀人 AI 法規家教」平台。依照規格書 (PRD.md) 所設計的架構開發。

## 系統特色
1. **Offline-first 架構**：支援 PWA，並可透過 IndexedDB 在無網路時快取並閱讀法規與使用基礎語音。
2. **多階段學習**：從「第一輪建立全貌」開始，逐步加入複習、測驗與弱點加強。
3. **零成本策略**：使用 Vercel Hobby + Supabase Free + Gemini Free API + Browser TTS。
4. **ChatGPT Handoff**：一鍵將法規與說明帶入自己的 ChatGPT 進行追問，免除額外 API 費用。

## 本機開發與執行方式

### 1. 安裝依賴
```bash
cd webapp
npm install
```

### 2. 環境變數設定
複製 `.env.example` 並命名為 `.env.local`：
```bash
cp .env.example .env.local
```
並填入你的 `Supabase` 及 `Gemini` API Keys。

### 3. 資料庫設定
請到 Supabase 建立新專案，並將 `webapp/supabase/schema.sql` 中的內容貼入 SQL Editor 中執行，建立所有需要的資料表。

### 4. 啟動伺服器
```bash
npm run dev
```
打開瀏覽器進入 `http://localhost:3000`。

## 已完成的開發階段

- [x] **Phase 0** — 專案初始化 (Next.js, Tailwind, Supabase, PWA 基礎設定)
- [x] **Phase 1** — 法規引擎架構 (Schema 建立、法規 XML 解析草稿 `parseLawXml.ts`)
- [x] **Phase 2** — 第一輪閱讀器 UI (首頁儀表板、法規總覽、單一法規目錄、單一法條學習頁面)
- [x] **Phase 4** — 語音 UI (雙軌語音：Browser TTS / AI TTS 播放元件)
- [x] **Phase 5** — AI 老師 (ChatGPT Handoff 按鈕、API 路由骨架、AI 聊天室頁面)
- [x] **Phase 6** — 複習系統 UI (間隔複習中心面板)

## 接下來的計畫
若要接續完成，可透過 Vercel 進行部署，並將爬蟲 (`parseLawXml.ts`) 解析出的資料匯入 Supabase 中即可讓網站動起來。
