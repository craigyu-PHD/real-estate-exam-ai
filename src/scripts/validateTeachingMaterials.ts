import { generatedArticlesFlat } from '../data/generatedArticles';
import { generatedTeachingMaterials } from '../data/generatedTeachingMaterials';

const forbidden = ['待補', '生成中', '本條原文已載入', '本條原文已載錄', '通用案例', '請先以 758', '完整版將補上'];
const entries = Object.values(generatedTeachingMaterials);
const errors: string[] = [];

if (entries.length !== generatedArticlesFlat.length) errors.push(`count mismatch ${entries.length}/${generatedArticlesFlat.length}`);
const ids = new Set<string>();
const explanationSet = new Set<string>();
const caseSet = new Set<string>();
for (const material of entries) {
  if (ids.has(material.id)) errors.push(`duplicate id ${material.id}`);
  ids.add(material.id);
  const article = generatedArticlesFlat.find(a => `${a.lawId}-${a.articleNumber}` === material.id);
  if (!article) errors.push(`orphan material ${material.id}`);
  for (const [field, value] of Object.entries({ oneLiner: material.oneLiner, explanation: material.explanation, why: material.why, lectureScript: material.lectureScript })) {
    const minLength = field === 'oneLiner' ? 14 : 20;
    if (typeof value !== 'string' || value.trim().length < minLength) errors.push(`${material.id} weak ${field}`);
    if (forbidden.some(word => value.includes(word))) errors.push(`${material.id} placeholder in ${field}`);
  }
  if (material.cases.length < 2 || material.pitfalls.length < 1 || material.examTips.length < 2 || material.keywords.length < 2) errors.push(`${material.id} incomplete arrays`);
  if (explanationSet.has(material.explanation)) errors.push(`${material.id} duplicate explanation`);
  explanationSet.add(material.explanation);
  if (caseSet.has(material.cases[0].content)) errors.push(`${material.id} duplicate case`);
  caseSet.add(material.cases[0].content);
  if (article && !material.lectureScript.includes(article.text)) errors.push(`${material.id} lecture missing official text`);
}

if (errors.length) {
  console.error(errors.slice(0, 100).join('\n'));
  throw new Error(`Teaching material QA failed: ${errors.length} errors`);
}
console.log(`QA PASS: ${entries.length} materials, ${explanationSet.size} unique explanations, ${caseSet.size} unique primary cases, no placeholders.`);
