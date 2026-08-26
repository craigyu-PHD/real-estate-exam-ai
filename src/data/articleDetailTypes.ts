export interface ArticleDetailData {
  id: string;
  lawId: string;
  articleNumber: string;
  articleText: string;
  oneLiner: string;
  explanation: string;
  why: string;
  cases: { title: string; content: string }[];
  pitfalls: string[];
  confuseWith?: { article: string; diff: string }[];
  examTips: string[];
  relatedArticles: string[];
  keywords: string[];
  importance: number;
  lectureScript?: string;
  qa?: { sourceAnchored: true; placeholderFree: true; generatedAt: string; generatorVersion: string };
}
