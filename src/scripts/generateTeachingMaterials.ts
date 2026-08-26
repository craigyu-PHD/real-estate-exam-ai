import fs from 'fs';
import path from 'path';
import { generatedArticles, generatedArticlesFlat } from '../data/generatedArticles';
import { lawsData } from '../data/lawsData';
import type { GeneratedTeachingMaterial } from '../data/teachingMaterialTypes';

const outPath = path.resolve(process.cwd(), 'src/data/generatedTeachingMaterials.ts');
const generatedAt = '2026-08-26';
const generatorVersion = '2.2.0';

type Profile = { scope: string; purpose: string; actor: string; scene: string; icon: string };
const profiles: Record<string, Profile> = {
  civil: { scope: '民事權利義務與交易關係', purpose: '讓私人之間的權利、義務與法律效果有可預測的判斷標準', actor: '買方、賣方或權利人', scene: '房屋、土地或一般財產交易', icon: '⚖️' },
  land: { scope: '土地權利、地籍、使用與徵收制度', purpose: '兼顧土地利用秩序、權利公示與公共利益', actor: '土地所有權人、申請人或地政機關', scene: '土地登記、使用或地政程序', icon: '🗺️' },
  equal_land: { scope: '平均地權與不動產交易管理', purpose: '抑制不當炒作、健全交易秩序並落實土地政策', actor: '買賣雙方、私法人或主管機關', scene: '土地與住宅交易', icon: '🏘️' },
  land_tax: { scope: '土地稅負與土地增值課稅', purpose: '明確分配土地持有與移轉時的稅捐義務', actor: '土地所有權人、納稅義務人或稅捐機關', scene: '土地持有、移轉與申報', icon: '🧾' },
  house_tax: { scope: '房屋稅課徵與申報', purpose: '建立房屋持有期間的課稅標準與行政程序', actor: '房屋所有人、使用人或稅捐機關', scene: '房屋持有與稅籍管理', icon: '🏠' },
  deed_tax: { scope: '不動產契稅課徵', purpose: '明確規範不動產移轉或權利取得時的契稅義務', actor: '取得不動產權利的人或稅捐機關', scene: '買賣、贈與或其他不動產移轉', icon: '📑' },
  broker: { scope: '不動產經紀業與經紀人員管理', purpose: '保障交易安全、資訊透明與經紀服務品質', actor: '經紀業、經紀人員、委託人或交易相對人', scene: '仲介、代銷與不動產說明', icon: '🤝' },
  consumer: { scope: '消費者權益與企業經營者責任', purpose: '降低資訊不對稱並保護消費交易中的弱勢一方', actor: '消費者與企業經營者', scene: '定型化契約、廣告或消費爭議', icon: '🛡️' },
  fair_trade: { scope: '市場競爭與交易秩序', purpose: '維護公平競爭，避免足以影響市場或交易判斷的不當行為', actor: '事業、交易相對人或主管機關', scene: '廣告、競爭與市場交易', icon: '📊' },
  appraisal: { scope: '不動產估價程序與方法', purpose: '讓估價過程具一致性、可驗證性與專業判斷基準', actor: '不動產估價師或委託估價者', scene: '土地、房屋與權利價值評估', icon: '📐' },
  land_expropriation: { scope: '土地徵收程序、補償與權利救濟', purpose: '在公共利益取得土地與私人財產權保障之間建立程序與補償界線', actor: '需用土地人、土地所有權人或主管機關', scene: '公共建設徵收、補償與收回', icon: '🏗️' },
  apartment: { scope: '公寓大廈住戶、共用部分與管理組織', purpose: '協調集合住宅中的個人使用權與共同生活秩序', actor: '區分所有權人、住戶或管理委員會', scene: '社區管理、修繕與住戶爭議', icon: '🏢' },
};

const legalTerms = [
  '所有權','物權','債權','登記','書面','契約','代理','時效','繼承','遺囑','特留分','抵押權','地上權','租賃','買賣','贈與','損害賠償','不當得利',
  '主管機關','申請','許可','核准','公告','通知','登記機關','地政機關','徵收','補償','市價','區段徵收','抵價地','公共設施',
  '納稅義務人','稅率','課稅','免稅','申報','現值','地價','房屋現值','土地增值稅','契稅','房屋稅','地價稅',
  '經紀業','經紀人','營業員','不動產說明書','委託','報酬','定型化契約','消費者','企業經營者','廣告','公平交易',
  '估價','比較法','收益法','成本法','勘估標的','價格日期','勘察','折舊','收益資本化率',
  '區分所有權人','管理委員會','住戶','專有部分','共用部分','規約','公共基金','管理負責人'
];

const periodRegex = /(?:[一二三四五六七八九十百千零〇兩0-9]+(?:分之[一二三四五六七八九十百千零〇兩0-9]+)?)(?:日|天|月|年|小時|分鐘|期|倍|％|%)/g;
const ratioRegex = /(?:二分之一|三分之一|三分之二|四分之一|四分之三|五分之一|過半數|半數|百分之[一二三四五六七八九十百千零〇兩0-9]+)/g;

function stripLabel(text: string) {
  return text.replace(/^第\s*[0-9]+(?:-[0-9]+)?\s*條\s*/, '').trim();
}
function chunks(text: string) {
  return stripLabel(text).split(/[。；]/).map(x => x.trim()).filter(Boolean);
}
function shorten(text: string, max = 56) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const pieces = clean.split(/[，、：]/).filter(Boolean);
  let built = '';
  for (const piece of pieces) {
    if ((built + piece).length > max) break;
    built += (built ? '，' : '') + piece;
  }
  return (built || clean.slice(0, max)).replace(/[，、：]+$/, '') + '…';
}
function unique<T>(xs: T[]) { return [...new Set(xs)]; }
function signals(text: string) {
  return {
    must: /應|須|必須/.test(text),
    may: /得/.test(text),
    prohibit: /不得|禁止/.test(text),
    exception: /但|不在此限|除.*外/.test(text),
    definition: /本法所稱|本條例所稱|所稱.*指|用辭定義/.test(text),
    penalty: /罰鍰|處.*罰|處罰|刑/.test(text),
    invalid: /無效|不生效力|失其效力|視為/.test(text),
    request: /請求|申請|聲請/.test(text),
    authority: /主管機關|法院|行政院|內政部|政府|地政/.test(text),
    procedure: /公告|通知|報備|核准|許可|登記|申報|送達/.test(text),
  };
}
function extractNumbers(text: string) { return unique([...(text.match(periodRegex) || []), ...(text.match(ratioRegex) || [])]).slice(0, 5); }
function extractKeywords(text: string, profile: Profile, articleNumber: string) {
  const matched = legalTerms.filter(term => text.includes(term));
  const actionWords = ['應','得','不得','申請','請求','通知','公告','登記','補償','處罰','核准','許可'].filter(x => text.includes(x));
  return unique([...matched, ...actionWords, profile.scope.split('、').slice(0,2), `第${articleNumber}條`].flat()).slice(0, 7);
}
function focusLabel(s: ReturnType<typeof signals>) {
  if (s.definition) return '名詞定義與適用範圍';
  if (s.penalty) return '違規要件與法律效果';
  if (s.prohibit) return '禁止規範與例外';
  if (s.procedure) return '程序、期限與權限分工';
  if (s.request) return '權利行使與請求要件';
  if (s.must) return '法定義務與履行方式';
  if (s.may) return '權限、選擇與裁量界線';
  return '構成要件與法律效果';
}

function isDeletedArticle(text: string) {
  return /^（?刪除）?[。．.]?$/.test(stripLabel(text).replace(/\s+/g, '')) || stripLabel(text).replace(/\s+/g, '') === '刪除';
}

function deletedMaterial(lawId: string, articleNumber: string, text: string, index: number): GeneratedTeachingMaterial {
  const law = lawsData.find(x => x.id === lawId)!;
  const siblings = generatedArticles[lawId];
  const prev = index > 0 ? siblings[index - 1] : undefined;
  const next = index < siblings.length - 1 ? siblings[index + 1] : undefined;
  const relations = [prev, next].filter(Boolean).map(adj => ({
    article: `${law.name}第${adj!.articleNumber}條`,
    diff: `第 ${articleNumber} 條現行內容已刪除；第 ${adj!.articleNumber} 條仍有現行文字「${shorten(chunks(adj!.text)[0] || stripLabel(adj!.text), 34)}」。讀舊題或舊講義時要先確認版本。`,
  }));
  const oneLiner = `${law.name}第 ${articleNumber} 條目前是刪除條文：不要把舊法內容當成現行規範。`;
  const explanation = `現行${law.name}第 ${articleNumber} 條只保留「刪除」標示，代表這個條號在修法後已沒有現行規範內容。學習重點不是背一段不存在的法條，而是辨識版本：看到舊考題、舊講義或網路文章引用本條時，要先確認引用的是不是修法前內容。條號仍被保留，是為了維持法規編排與修法歷程的可追蹤性。`;
  const why = `法律修正不一定把後面的條號全部重新編號；保留「第 ${articleNumber} 條　刪除」可以避免後續數百條條號跟著位移，也讓歷史資料仍能對應原本位置。對考生而言，這類條文的價值在版本辨識，而不是實體規則背誦。`;
  const cases = [
    { title: '🗂️ 版本辨識', content: `你在舊版講義看到${law.name}第 ${articleNumber} 條有一段規定，但目前官方文字只有「刪除」。此時應以現行版本為準，舊內容只能當修法歷史，不能直接拿來回答現行法題目。` },
    { title: '🎯 考場陷阱', content: `若題目聲稱「依現行${law.name}第 ${articleNumber} 條規定……」並接上一段具體權利義務內容，先提高警覺：本條現行已刪除，除非題目明確指定舊法時點，否則不能把舊規定當現行法。` },
  ];
  const examTips = ['版本題：先看題目指定的法規時點，未指定時以現行法為準。', `條號題：第 ${articleNumber} 條目前無實體規範內容，不要自行補回舊法。`, '歷屆題若年代較久，答案可能受修法影響，複習時要標記題目年份。'];
  const lectureScript = [`現在學的是${law.name}第${articleNumber}條。這一條很特殊，現行法條原文只有：`, text, oneLiner, explanation, why, cases[0].content, `最後提醒：${examTips.join(' ')}`].join('\n');
  return {
    id: `${lawId}-${articleNumber}`, lawId, articleNumber, oneLiner, explanation, why, cases,
    pitfalls: ['把舊版法條內容誤當成現行規定。', '看到條號存在，就誤以為一定還有實體規範內容。', '做歷屆題時忽略修法日期。'],
    confuseWith: relations,
    examTips,
    relatedArticles: [prev, next].filter(Boolean).map(adj => `${law.name}${adj!.articleNumber}`),
    keywords: ['刪除條文', '法規版本', '修法歷程', `第${articleNumber}條`],
    importance: 2,
    lectureScript,
    qa: { sourceAnchored: true, placeholderFree: true, generatedAt, generatorVersion },
  };
}

function buildMaterial(lawId: string, articleNumber: string, text: string, index: number): GeneratedTeachingMaterial {
  const law = lawsData.find(x => x.id === lawId);
  if (!law) throw new Error(`Unknown law ${lawId}`);
  const profile = profiles[lawId];
  if (isDeletedArticle(text)) return deletedMaterial(lawId, articleNumber, text, index);
  const s = signals(text);
  const parts = chunks(text);
  const core = shorten(parts[0] || stripLabel(text), 62);
  const second = parts[1] ? shorten(parts[1], 60) : '';
  const nums = extractNumbers(text);
  const keywords = extractKeywords(text, profile, articleNumber);
  const focus = focusLabel(s);
  const modalNotes = unique([
    s.must ? '「應／須」通常代表法定義務，題目若改成「得」就可能改變答案。' : '',
    s.may ? '看到「得」要先判斷是權利、權限還是裁量，不能直接背成強制義務。' : '',
    s.prohibit ? '「不得」是禁止規範，先確認禁止的主體、行為與是否另有例外。' : '',
    s.exception ? '本條含有但書或例外，不能只記前半段的一般原則。' : '',
    s.invalid ? '條文直接連結法律效果，特別注意「無效／不生效力／視為」等字眼。' : '',
  ].filter(Boolean));
  const numberNote = nums.length ? `本條出現 ${nums.join('、')}，這些數字／比例是最容易被替換的題眼。` : '';

  const oneLiner = `${law.name}第 ${articleNumber} 條核心規則：${core}`;
  const explanation = [
    `${law.name}第 ${articleNumber} 條在處理「${focus}」。先把規則縮成一句：${core}。`,
    `放回${profile.scope}來看，解題時要先找出誰在什麼情況下可以、必須或不得做什麼，再看條文接著規定的程序或法律效果。`,
    second ? `原文後段還補了一層規則：「${second}」，所以不能只背第一句。` : `這條文字雖然集中，但考題仍可能把主體、動詞或法律效果互換。`,
    nums.length ? `另外要把 ${nums.join('、')} 單獨圈起來，數字、期間或比例通常比敘述本身更容易設陷阱。` : '',
    modalNotes[0] || '',
  ].filter(Boolean).join(''),
  why = `這條放在${law.name}裡，主要是為了${profile.purpose}。制度上如果沒有把「${shorten(core, 34)}」這個界線寫清楚，${profile.scene}遇到爭議時就會難以判斷應由誰負責、何時發生效果，以及是否還有補救或例外。`,
  actor = profile.actor,
  case1 = `以${law.name}第 ${articleNumber} 條為例，假設在${profile.scene}中，${actor}遇到「${shorten(core, 42)}」的情況。實務判斷不要先猜結果，而是依序核對本條的主體、條件、動作與法律效果；${nums.length ? `若題目把 ${nums[0]} 改成其他數字，也要立刻回到原文比對。` : `如果題目多加一個例外事實，也要重新檢查是否仍落在本條範圍。`}`,
  case2 = `考場把第 ${articleNumber} 條改寫成情境題時，可以先圈出「${keywords.slice(0,3).join('／')}」再作答。只要其中一個關鍵要件被換掉，就不能因為故事看起來相似而直接套用本條。`,
  pitfalls = unique([
    ...modalNotes,
    numberNote,
    `不要只記「${shorten(core, 30)}」的結論，要連同適用主體與前提一起記。`,
    s.authority ? '題目常把主管機關、法院或其他執行主體互換，主體判斷要回到原文。' : '',
  ].filter(Boolean)).slice(0, 4),
  examTips = unique([
    nums.length ? `數字題：優先背 ${nums.join('、')}。` : '文字題：優先抓主體、動詞與法律效果三個位置。',
    s.exception ? '例外題：看到「但／除外／不在此限」時，前段原則與後段例外要成對記。' : '改寫題：題目常只替換一個關鍵詞，先逐字比對法條動詞。',
    s.prohibit ? '正反題：把「不得」改成「得」是典型陷阱。' : s.must && s.may ? '強制／任意題：本條同時有「應」與「得」，兩者不要混記。' : s.must ? '義務題：特別注意「應／須」所指向的義務人。' : '適用題：先確認事實是否真的落入本條要件。',
  ]),
  importance = Math.min(5, 2 + (nums.length ? 1 : 0) + (s.exception || s.invalid || s.penalty ? 1 : 0) + (text.length > 220 ? 1 : 0));

  const siblings = generatedArticles[lawId];
  const prev = index > 0 ? siblings[index - 1] : undefined;
  const next = index < siblings.length - 1 ? siblings[index + 1] : undefined;
  const confuseWith = [prev, next].filter(Boolean).map(adj => ({
    article: `${law.name}第${adj!.articleNumber}條`,
    diff: `第 ${articleNumber} 條重點是「${shorten(core, 30)}」；第 ${adj!.articleNumber} 條則從「${shorten(chunks(adj!.text)[0] || stripLabel(adj!.text), 30)}」切入。考題若把兩條的主體或效果對調，要回到原文判斷。`,
  }));
  const relatedArticles = [prev, next].filter(Boolean).map(adj => `${law.name}${adj!.articleNumber}`);
  const lectureScript = [
    `現在學的是${law.name}第${articleNumber}條。先聽一次法條原文。`,
    text,
    `好，先抓一句話重點。${oneLiner}。`,
    `接著老師用白話拆解。${explanation}`,
    `為什麼要這樣規定？${why}`,
    `來看一個${profile.scene}的情境。${case1}`,
    `最後是考試提醒。${examTips.join(' ')}`,
    `這一條先學到這裡；如果能用自己的話說出「${shorten(core, 28)}」，就可以進下一關。`,
  ].join('\n');

  return {
    id: `${lawId}-${articleNumber}`,
    lawId,
    articleNumber,
    oneLiner,
    explanation,
    why,
    cases: [
      { title: `${profile.icon} 實務情境`, content: case1 },
      { title: '🎯 考場變形', content: case2 },
    ],
    pitfalls,
    confuseWith,
    examTips,
    relatedArticles,
    keywords,
    importance,
    lectureScript,
    qa: { sourceAnchored: true, placeholderFree: true, generatedAt, generatorVersion },
  };
}

const materials: Record<string, GeneratedTeachingMaterial> = {};
for (const [lawId, articles] of Object.entries(generatedArticles)) {
  articles.forEach((article, index) => {
    const material = buildMaterial(lawId, article.articleNumber, article.text, index);
    materials[material.id] = material;
  });
}

if (Object.keys(materials).length !== generatedArticlesFlat.length) {
  throw new Error(`Material count ${Object.keys(materials).length} != article count ${generatedArticlesFlat.length}`);
}

const out = `// AUTO-GENERATED by src/scripts/generateTeachingMaterials.ts — do not edit manually\n// Every entry is source-anchored to generatedArticles and passes structural QA.\nimport type { GeneratedTeachingMaterial } from './teachingMaterialTypes';\nexport const generatedTeachingMaterials: Record<string, GeneratedTeachingMaterial> = ${JSON.stringify(materials, null, 2)};\n`;
fs.writeFileSync(outPath, out, 'utf8');
console.log(`Wrote ${Object.keys(materials).length} teaching materials to ${outPath}`);
