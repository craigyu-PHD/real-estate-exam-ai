export type TeachingCase = { title: string; content: string };
export type TeachingRelation = { article: string; diff: string };

export interface GeneratedTeachingMaterial {
  id: string;
  lawId: string;
  articleNumber: string;
  oneLiner: string;
  explanation: string;
  why: string;
  cases: TeachingCase[];
  pitfalls: string[];
  confuseWith: TeachingRelation[];
  examTips: string[];
  relatedArticles: string[];
  keywords: string[];
  importance: number;
  lectureScript: string;
  qa: {
    sourceAnchored: true;
    placeholderFree: true;
    generatedAt: string;
    generatorVersion: string;
  };
}
