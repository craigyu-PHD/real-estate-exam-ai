export type ReleaseStatus = 'completed' | 'current' | 'planned';
export type ReleaseEntry = { version:string; date:string; title:string; status:ReleaseStatus; progress:number; summary:string; highlights:string[]; };
export const currentVersion='2.3.0';
export const releaseLog:ReleaseEntry[]=[
  {version:'2.4.0',date:'規劃中',title:'PWA 現代化 × 教材人工抽驗 × 雲端同步',status:'planned',progress:0,summary:'下一階段集中清理舊 PWA/Workbox 依賴、建立高頻教材人工審核流程，並強化跨裝置同步。',highlights:['替換舊 next-pwa 依賴鏈','高頻法條人工抽驗與核准標章','學習資料跨裝置同步']},
  {version:'2.3.0',date:'2026-08-26',title:'教材深度 × Natural TTS × Performance',status:'current',progress:100,summary:'針對土地法教材空泛、AI 快捷功能分散、語音等待與播放清單不同步進行品質與效能重構。',highlights:['土地法 262 條專用制度型教材＋高頻條文深度教材','AI Drawer 六個快捷問題與 Gemini/Groq/OpenRouter 備援','免 Key Edge Neural 台灣聲線＋串流播放','聽課防連點、預抓下一條、播放 session 失效機制','聽課版面與播放清單同步修正','Iron Forge 與五套主題商業化配色微調']},
  {version:'2.2.0',date:'2026-08-26',title:'2,399 條教材 × AI Context × Theme Engine',status:'completed',progress:100,summary:'重建法條資料與教材層，讓每條法規都有預先產生的客製教材、Mini Lecture 與可追問 AI，並加入完整題庫篩選與五套原創主題。',highlights:['12 部法規共 2,399 條，修正章節污染','2,399 份唯一教材與 Mini Lecture QA','Article AI Drawer 自動帶入當前條文','50 題題庫＋題量／章節／狀態／題型篩選','System／Light／Dark × 五套原創 Theme Pack']},
  {version:'2.1.0',date:'2026-08-26',title:'版面重整 × 淺色系統 × Gemini 自助連線',status:'completed',progress:100,summary:'針對 V2.0 的遮蓋、淺色模式與精細度不足進行產品級重整。',highlights:['側欄重構，更新日誌改獨立抽屜','全站 Light/Dark 語意色彩系統','Gemini 免費 Key 可在設定頁直接連線','Logo、學習中心、題庫、複習、搜尋與進度頁重整']},
  {version:'2.0.0',date:'2026-08-26',title:'自然語音 × 企業級 UI × 遊戲化',status:'completed',progress:100,summary:'完成核心學習體驗第二代改版，讓閱讀、聽課與每日進度形成連續學習路徑。',highlights:['自然語音備援','LV／XP／每日任務','首頁與法條頁重整','複合條號與已讀修正']},
  {version:'1.9.0',date:'2026-08-25',title:'企業級視覺系統整併',status:'completed',progress:100,summary:'統一明暗主題、首頁資訊層級與學習中心導覽。',highlights:['Light／Dark 初版','首頁與卡片重塑','導覽整理']},
  {version:'1.8.0',date:'2026-08-25',title:'法規與複習核心功能',status:'completed',progress:100,summary:'建立全文法規、搜尋、聽課、SM2 複習與題庫雛形。',highlights:['2,262 條法規資料','搜尋與聽課','SM2 複習','Supabase 同步骨架']},
];
