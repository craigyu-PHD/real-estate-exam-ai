import 'server-only';
import { getArticleDetail } from '@/data/articleExplanations';
import { lawsData } from '@/data/lawsData';

export function getPodcastLecture(lawId: string, articleId: string) {
  const detail = getArticleDetail(lawId, articleId);
  if (!detail) return null;
  const lawName = lawsData.find(law => law.id === lawId)?.name || lawId;
  const cases = detail.cases.map((item, index) => `案例 ${index + 1}，${item.title}。${item.content}`).join('\n');
  const exam = detail.examTips.map((tip, index) => `考點 ${index + 1}，${tip}`).join('\n');
  const lectureScript = [
    `現在進入 ${lawName} 第 ${articleId} 條。先完整聽一次法條原文。`,
    detail.articleText,
    `原文先到這裡。這一條的一句話重點是：${detail.oneLiner}`,
    `接著做白話拆解。${detail.explanation}`,
    `再來說明法律為什麼這樣規定。${detail.why}`,
    `把規則放進實際情境。${cases}`,
    `最後整理國考最需要記住的地方。${exam}`,
    `這一條先學到這裡。你可以回到學習頁標記理解程度，或直接問 AI 老師延伸追問。`,
  ].filter(Boolean).join('\n');
  return { detail, lawName, lectureScript };
}
