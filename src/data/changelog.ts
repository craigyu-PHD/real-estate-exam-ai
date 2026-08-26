export type ReleaseStatus = 'completed' | 'current' | 'planned';
export type ReleaseEntry = { version:string; date:string; title:string; status:ReleaseStatus; progress:number; summary:string; highlights:string[]; };
export const currentVersion='2.1.0';
export const releaseLog:ReleaseEntry[]=[
  {version:'2.2.0',date:'規劃中',title:'資料純度與題庫深化',status:'planned',progress:0,summary:'下一階段集中處理法規 parser 純度、題庫擴充與弱點任務。',highlights:['法規 parser 全面驗證','題庫與錯題回補','章節 Boss 與弱點任務']},
  {version:'2.1.0',date:'2026-08-26',title:'版面重整 × 淺色系統 × Gemini 自助連線',status:'current',progress:100,summary:'針對 V2.0 的遮蓋、淺色模式與精細度不足進行產品級重整。',highlights:['側欄重構，更新日誌改獨立抽屜','全站 Light/Dark 語意色彩系統','Gemini 免費 Key 可在設定頁直接連線','Logo、學習中心、題庫、複習、搜尋與進度頁重整']},
  {version:'2.0.0',date:'2026-08-26',title:'自然語音 × 企業級 UI × 遊戲化',status:'completed',progress:100,summary:'完成核心學習體驗第二代改版，讓閱讀、聽課與每日進度形成連續學習路徑。',highlights:['自然語音備援','LV／XP／每日任務','首頁與法條頁重整','複合條號與已讀修正']},
  {version:'1.9.0',date:'2026-08-25',title:'企業級視覺系統整併',status:'completed',progress:100,summary:'統一明暗主題、首頁資訊層級與學習中心導覽。',highlights:['Light／Dark 初版','首頁與卡片重塑','導覽整理']},
  {version:'1.8.0',date:'2026-08-25',title:'法規與複習核心功能',status:'completed',progress:100,summary:'建立全文法規、搜尋、聽課、SM2 複習與題庫雛形。',highlights:['2,262 條法規資料','搜尋與聽課','SM2 複習','Supabase 同步骨架']},
];
