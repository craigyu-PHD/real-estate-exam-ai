export type ReleaseStatus = 'completed' | 'current' | 'planned';

export type ReleaseEntry = {
  version: string;
  date: string;
  title: string;
  status: ReleaseStatus;
  progress: number;
  summary: string;
  highlights: string[];
};

export const currentVersion = '2.0.0';

export const releaseLog: ReleaseEntry[] = [
  {
    version: '2.1.0',
    date: '規劃中',
    title: '題庫闖關與成就深化',
    status: 'planned',
    progress: 0,
    summary: '下一階段將把題庫、弱點修復與成就系統接成完整闖關循環。',
    highlights: ['章節 Boss 題', '弱點修復任務', '成就徽章與複習獎勵'],
  },
  {
    version: '2.0.0',
    date: '2026-08-26',
    title: '自然語音 × 企業級 UI × 遊戲化',
    status: 'current',
    progress: 100,
    summary: '完成核心學習體驗第二代改版，讓閱讀、聽課與每日進度形成一條連續學習路徑。',
    highlights: ['Gemini 自然語音與免費備援', 'LV／XP／每日 8 條任務', '首頁、法條、聽課、設定頁重整', '複合條號與取消已讀修正'],
  },
  {
    version: '1.9.0',
    date: '2026-08-25',
    title: '企業級視覺系統整併',
    status: 'completed',
    progress: 100,
    summary: '統一明暗主題、首頁資訊層級與學習中心導覽。',
    highlights: ['Light／Dark 設計系統', '首頁與卡片視覺重塑', '導覽與學習中心整理'],
  },
  {
    version: '1.8.0',
    date: '2026-08-25',
    title: '法規與複習核心功能',
    status: 'completed',
    progress: 100,
    summary: '建立全文法規、搜尋、聽課、SM2 複習與題庫雛形。',
    highlights: ['2,262 條法規資料', '搜尋與聽課', 'SM2 複習', 'Supabase 同步骨架'],
  },
];
