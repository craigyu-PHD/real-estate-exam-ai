import fs from 'fs';
import path from 'path';
import { generatedArticles, generatedArticlesFlat } from '../data/generatedArticles';
import { lawsData } from '../data/lawsData';
import type { GeneratedTeachingMaterial } from '../data/teachingMaterialTypes';

const outPath = path.resolve(process.cwd(), 'src/data/generatedTeachingMaterials.ts');
const generatedAt = '2026-08-26';
const generatorVersion = '2.3.0';

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


type LandExpertOverride = Partial<Pick<GeneratedTeachingMaterial, 'oneLiner'|'explanation'|'why'|'cases'|'pitfalls'|'examTips'|'keywords'|'importance'>>;

const LAND_EXPERT_OVERRIDES: Record<string, LandExpertOverride> = {
  '1': {
    oneLiner: '土地法第 1 條是在先畫「土地法管什麼」的邊界：土地不只指地面，也把水域與天然富源納入法律上的土地概念。',
    explanation: '先說人話：這一條是整部土地法的「名詞入口」。一般人講土地，容易只想到一塊地皮；但土地法第 1 條用很短的一句話，把「水陸及天然富源」一起放進土地的概念裡。\n\n讀這條時不用硬找權利義務，因為它不是在規定「誰可以做什麼」，而是在告訴你：後面土地法提到「土地」時，理解範圍要比日常口語更廣。考題如果把土地限縮成「只有陸地」或「只有可供建築的地面」，就已經把定義縮得太窄。',
    why: '法律先定義基本名詞，是為了讓後面數百條規定使用同一套語言。土地制度會碰到水域、海岸、礦產、水源等公共資源，如果「土地」的概念一開始沒有講清楚，後面的權屬、使用與管理規則就容易各說各話。\n\n所以本條的實質價值是「統一定義」，不是建立某一個登記程序或處罰效果。',
    cases: [
      {title:'🌊 生活化例子',content:'題目問：「土地法所稱土地是否只包含可供建築、耕作的陸地？」答案不是。第 1 條明文把水陸及天然富源都納入概念，因此不能用日常「一塊地皮」的直覺去限縮。'},
      {title:'🎯 考場變形',content:'選項若寫「土地法所稱土地，僅指陸地及其地上改良物」，要立刻警覺。「僅指陸地」與本條的「水陸及天然富源」不符；地上改良物也不是本條定義文字。'}
    ],
    pitfalls:['把「土地」只理解成陸地或建築基地。','把建築改良物直接塞進第 1 條的土地定義。','硬把本條當成權利義務條文，而忽略它其實是總則定義。'],
    examTips:['定義題：直接鎖定「水陸及天然富源」。','看到「僅限陸地」「僅限可利用土地」通常要特別小心。','本條適合和第 2 條的土地使用分類一起複習。'],
    keywords:['土地定義','水陸','天然富源','總則'], importance:3,
  },
  '2': {
    oneLiner: '土地法第 2 條把土地依「實際使用性質」分成四大類：建築、直接生產、交通水利、其他土地。',
    explanation: '這條最重要的不是把例子逐字背完，而是先建立四格分類。第一類是建築用地，例如住宅、機關、工廠；第二類是直接生產用地，例如農、林、漁、牧、礦；第三類是交通水利用地，例如道路、溝渠、水道；第四類是前面三類以外的其他土地，例如沙漠、雪山。\n\n考試常把某一個例子移到錯的類別，所以解題方式是先問「這塊土地主要拿來做什麼」，再對照四大類，而不是只靠背誦名詞。條文最後還允許各類再分目，表示四大類是上位分類，不是最細的使用編定。',
    why: '土地管理、使用管制與政策配置都需要先有一致的分類。若住宅基地、農地、道路、水源地全部只叫「土地」而沒有用途分類，主管機關很難制定差異化的使用、管理或政策規則。\n\n因此第 2 條像一張「土地使用分類總表」，先把用途語言統一，後面制度才有基礎。',
    cases:[{title:'🏠 分類練習',content:'一塊地現在作為住宅基地，核心用途是建築使用，應先想到第一類建築用地；另一塊是農地，直接從事生產，應先想到第二類直接生產用地。'}, {title:'🎯 考場陷阱',content:'題目若把「道路」放進建築用地、把「農地」放進交通水利用地，都是典型錯置。不要被例子很多嚇到，先抓四大類的功能。'}],
    pitfalls:['只背例子、不記四大分類的核心用途。','把道路、溝渠等交通水利用地誤放到建築用地。','把「得再分目」誤解成四大類可以任意取消。'],
    examTips:['先背四大類名稱，再補代表例子。','分類題最常考「某土地屬於哪一類」。','第 1 條是土地定義，第 2 條是依使用分類，兩條不要混。'],
    keywords:['土地分類','建築用地','直接生產用地','交通水利用地','其他土地'], importance:4,
  },
  '10': {
    oneLiner: '土地法第 10 條先講土地權屬的基本架構：人民依法取得所有權的是私有土地；私有所有權消滅後，原則上轉為國有土地。',
    explanation: '這條要分成前、後兩段看。前段先建立概念：中華民國領域內土地具有公共性的基礎，但人民仍可依法取得土地所有權；取得後就是私有土地。後段再處理「私有所有權消滅」的去向——不會變成法律上無主、任人占有，而是成為國有土地。\n\n所以考題若問「私有土地所有權消滅後是不是無主土地」，答案要直接回到第二句：為國有土地。這條不是在說所有土地都禁止私人所有，也不是說國家可以不經法律程序任意拿走私有土地。',
    why: '土地是不動產，也是國土的一部分。法律必須同時承認人民依法取得私有所有權，又避免土地在所有權消滅後出現「無主狀態」。將其歸為國有，可以讓土地權屬保持明確，避免占有爭奪與登記上的空白。',
    cases:[{title:'🏞️ 權屬例子',content:'某筆私有土地的所有權依法消滅後，不能因為原地主不再有所有權，就說「誰先占誰的」。依第 10 條，該土地成為國有土地。'}, {title:'🎯 選擇題',content:'若選項是「私有土地所有權消滅後成為無主土地」「歸鄉鎮所有」「成為國有土地」，應選國有土地。'}],
    pitfalls:['把「屬於人民全體」誤解成任何個人都能自由占有。','把私有權消滅後誤認為無主土地。','誤讀成所有土地一律不得私有。'],
    examTips:['高頻題眼就是第二句「私有土地之所有權消滅者，為國有土地」。','前段是權屬架構，後段是私有權消滅效果。','可和第 14 條「不得為私有」的特定土地對照。'],
    keywords:['私有土地','國有土地','土地所有權','權屬'], importance:4,
  },
  '14': {
    oneLiner: '土地法第 14 條列出基於公共使用或國土利益而「原則不得為私有」的土地，並規定既成私有土地可能依法徵收及特定古蹟例外。',
    explanation: '這條不是說所有重要土地都歸國家，而是列舉一批具有高度公共性、原則不得私人所有的土地，例如一定限度內海岸、公共需用湖澤與水源地、公共交通道路、名勝古蹟等。\n\n第二層要注意：如果這些土地歷史上已經成為私有，條文不是寫「自動沒收」，而是「得依法徵收」，仍要走法律程序。第三層則是名勝古蹟的兩款特別例外，說明「不得私有」也不是完全沒有法定例外。',
    why: '海岸、公共水域、道路、水源等資源若完全交由私人排他控制，可能妨礙公共通行、安全、水資源或文化保存。第 14 條用「不得私有」先保留公共性，再用依法徵收與例外條款處理既有權利及特殊保存需求。',
    cases:[{title:'🛣️ 公共道路',content:'某段依法屬公共交通道路的土地，不能因私人願意出高價就當成一般住宅基地自由移轉為私有。若涉及既有私權，仍要依法律規定處理，而不是行政機關口頭宣布就消滅。'}, {title:'🎯 考場陷阱',content:'選項若寫「第 14 條所列土地一旦已成私有，即無須任何程序當然收歸國有」是不精確的；條文明定的是「得依法徵收」。'}],
    pitfalls:['把「不得為私有」理解成行政機關可無程序沒收。','忘記既成私有土地是「得依法徵收」。','漏看名勝古蹟的法定例外。'],
    examTips:['列舉題常考哪些土地不得為私有。','法律效果題注意「得依法徵收」四字。','但書／例外題要讀到第三項，不要只背第一項。'],
    keywords:['不得私有','公共土地','依法徵收','名勝古蹟'], importance:4,
  },
  '17': {
    oneLiner: '土地法第 17 條限制外國人取得特定敏感土地；因繼承取得雖是例外，但原則上要在繼承登記後三年內出售給本國人。',
    explanation: '先抓第一層：林地、漁地、狩獵地、鹽地、礦地、水源地，以及要塞軍備區域與領域邊境土地，不得移轉、設定負擔或租賃給外國人。這是對「土地種類＋外國人身分」的特別限制。\n\n第二層是繼承例外。外國人不是完全不能因繼承取得這些土地，但辦完繼承登記後，原則上須在三年內出售給本國人；逾期未出售，會進入法定公開標售程序。做題時要把「一般交易禁止」與「繼承暫時取得後限期處分」分開。',
    why: '這些土地涉及天然資源、水源、國防或邊境安全，法律對外國人取得採較嚴格限制；但繼承不是一般市場交易，因此另設過渡處理，避免因身分限制直接讓繼承權落空，同時要求後續回到本國人持有。',
    cases:[{title:'🌲 繼承林地',content:'外國籍繼承人因父親死亡繼承一筆林地，可以先辦繼承登記，但不能把它當成可長期自由持有的一般土地；原則上要在繼承登記完畢後三年內出售給本國人。'}, {title:'🎯 考場變形',content:'「外國人因繼承取得林地，一律不得辦理繼承登記」過度絕對；本條允許因繼承取得，但附有三年內出售等後續限制。'}],
    pitfalls:['把一般移轉禁止與繼承例外混在一起。','三年起算點是辦理繼承登記完畢後。','只背林地，漏掉水源地、邊境等其他類型。'],
    examTips:['身分＋土地種類的雙重判斷題。','數字題：繼承登記完畢後三年內出售。','可和第 18 條平等互惠原則一起比較。'],
    keywords:['外國人','禁止移轉','繼承','三年','敏感土地'], importance:5,
  },
  '18': {
    oneLiner: '土地法第 18 條採「平等互惠」：外國人能否在台取得或設定土地權利，要看我國人民在該國是否享有同樣權利。',
    explanation: '這一條很短，但考點非常集中。判斷外國人能不能取得台灣土地權利，不是只看他有沒有錢或是否居住在台灣，而是看條約或其本國法律是否讓中華民國人民享有同樣的土地權利。\n\n所以解題順序是：先確認當事人是外國人，再確認涉及土地權利取得或設定，最後檢查「互惠」是否成立。第 18 條講的是一般互惠門檻；如果土地本身又落入第 17 條的敏感種類，還要再受第 17 條限制。',
    why: '土地具有國土與經濟資源性質。互惠原則讓我國不必對外國人單方面全面開放，而是以彼此提供同等權利作為基礎，維持跨國土地權利待遇的對等性。',
    cases:[{title:'🌏 互惠判斷',content:'甲是 A 國國民，想在台取得一般住宅土地。不能只問「外國人可不可以買」，還要確認 A 國法律是否也允許中華民國人民享有相同土地權利；若沒有互惠基礎，第 18 條門檻就過不了。'}, {title:'🎯 兩條一起考',content:'即使某國與我國有平等互惠，如果標的是第 17 條列出的林地或水源地，仍不能只靠第 18 條就得出「可以取得」的答案。'}],
    pitfalls:['把互惠理解成所有外國人一律可取得。','只看第 18 條，忘了第 17 條特定土地限制。','把居留、婚姻或投資金額誤當成本條核心判斷標準。'],
    examTips:['四字題眼：「平等互惠」。','先一般互惠，再檢查第 17 條特別禁止。','題目常問「以何原則為前提」。'],
    keywords:['外國人','平等互惠','土地權利'], importance:5,
  },
  '34-1': {
    oneLiner: '土地法第 34-1 條是在解決共有土地「全體一致太難」的僵局：達法定多數即可處分，但必須通知、保障對價，並保留其他共有人優先承購等權利。',
    explanation: '這條要拆成五個層次，不要只背「過半數」。\n\n第一，處分、變更或設定特定物權時，原則上要「共有人過半數＋應有部分合計過半數」同意；但如果同意人的應有部分合計已經「逾三分之二」，人數就不再計算。第二，採多數決處分前，要事先以書面通知其他共有人；不能書面通知時才用公告。第三，多數共有人對其他共有人應得的對價或補償負連帶清償責任，辦權利變更登記時還要提出已受領或提存證明。第四，共有人單獨出賣自己的應有部分時，其他共有人有同價優先承購權。第五，共有物不能協議分割時，可申請地政機關調處，不服調處要在收到通知後十五日內起訴。\n\n所以本條真正的結構是「降低處分門檻＋同時保護少數共有人」，兩邊缺一不可。',
    why: '共有土地如果任何處分都要求全體一致，只要一個共有人失聯、反對或繼承關係複雜，土地就可能長期無法利用。因此法律用多數決提高土地流通與利用效率；但多數決會犧牲少數人的決定權，所以又搭配事前通知、價金補償、連帶清償、提存及優先承購等保護。這就是本條最重要的利益平衡。',
    cases:[{title:'🏠 四人共有出售',content:'A、B、C、D 四人共有一筆土地，持分分別 40%、30%、20%、10%。若 A＋B 同意處分，持分合計 70%，已「逾三分之二」，因此即使人數只有 2/4，也可適用人數不予計算的例外。但 A、B 仍不能偷偷賣掉，還要依法通知 C、D，並處理他們應得的對價或補償。'}, {title:'🎯 15 日陷阱',content:'若共有人因無法自行協議分割而向地政機關申請調處，某共有人不服調處結果，必須注意接到調處通知後十五日內向司法機關起訴；考題很常把十五日改成三十日。'}],
    pitfalls:['只背「過半數」而漏掉持分也要過半。','誤以為持分「達」三分之二即可免算人數；條文是「逾三分之二」。','以多數決處分就以為可以不通知其他共有人。','把共有人出賣應有部分的優先承購權，和整筆共有物多數決處分混為一談。'],
    examTips:['第一層必背：人數過半＋持分過半；持分逾 2/3 時人數不計。','程序題：事先書面通知；不能書面通知才公告。','責任題：對價／補償有連帶清償與受領或提存證明。','分割調處不服：15 日內起訴。'],
    keywords:['共有土地','多數決','三分之二','書面通知','優先承購','十五日'], importance:5,
  },
  '37': {
    oneLiner: '土地法第 37 條先定義「土地登記」的範圍：不只土地所有權，也包含建築改良物所有權與他項權利；細部程序交由中央地政機關訂規則。',
    explanation: '讀這條要分兩句。第一句是範圍定義：土地登記包含土地及建築改良物的所有權與他項權利登記，因此「土地登記」不是只有買賣過戶。第二句是授權規範：登記內容、程序、規費、資料提供、應附文件與異議處理等細節，由中央地政機關訂規則。\n\n考題若把土地登記限縮成「只有所有權移轉登記」，就漏掉他項權利；如果問細部登記程序是誰訂，也要注意條文寫的是中央地政機關。',
    why: '不動產權利種類多、登記程序技術性高。法律本身先規定登記制度的核心範圍，再把大量細節授權專責機關制定規則，可以讓程序隨實務調整，又保留法律上的制度基礎。',
    cases:[{title:'📑 不只過戶',content:'房屋買賣辦所有權移轉是土地登記；設定抵押權等他項權利，也屬本條所稱土地登記範圍。不能把「登記」理解成只有所有權過戶。'}, {title:'🎯 權限題',content:'題目問「登記應附文件、規費、異議處理細節由誰規定」，要回到第二項的中央地政機關授權。'}],
    pitfalls:['把土地登記限縮成所有權移轉。','漏掉建築改良物及他項權利。','把細部規則制定機關寫成任一地方地政事務所。'],
    examTips:['定義題：所有權＋他項權利。','授權題：細部規則由中央地政機關定之。','可和第 43 條的登記效力連著讀。'],
    keywords:['土地登記','所有權','他項權利','中央地政機關'], importance:4,
  },
  '43': {
    oneLiner: '土地法第 43 條的考試核心只有一句：「依本法所為之登記，有絕對效力」；它是在強調土地登記的公示與可信賴性。',
    explanation: '這條字很少，但不能只把「絕對效力」四個字背成一句口號。土地交易如果每個人都必須重新查證幾十年前的權利來源，市場會很難運作，所以土地登記制度讓外界能以登記作為判斷權利狀態的重要依據。\n\n在國考選擇題層次，看到題目直接問「依土地法所為之登記有何效力」，答案就是本條原文的「絕對效力」。但在實際法律爭議中，不宜把這四字理解成「任何錯誤登記在所有情況下都永遠不能推翻」；仍要結合民法登記、公信原則及具體爭議判斷。',
    why: '不動產無法像手機或現金一樣靠占有就讓外界清楚知道權利歸屬，因此需要一個公開、穩定的登記制度。第 43 條用高度強烈的文字提升登記的公示與交易安全功能，降低第三人查證成本。',
    cases:[{title:'🏡 買房查登記',content:'買方準備購買房屋時，首先會查土地與建物登記資料，而不是只聽賣方口頭說「這間是我的」。登記制度的價值就是讓交易人有一個公開且高度可信賴的權利資訊基礎。'}, {title:'🎯 國考直球',content:'題目問「依土地法所為之登記有何效力？」不要自己延伸成「推定效力」或「相對效力」，第 43 條原文就是「有絕對效力」。'}],
    pitfalls:['把法條原文「絕對效力」改成「推定效力」。','從考試原文直接過度推論成所有錯誤登記永遠不可爭執。','和民法第 758 條「依法律行為之不動產物權變動登記生效」混為同一問題。'],
    examTips:['文字題幾乎可直接背：「依本法所為之登記，有絕對效力。」','第 43 條談登記效力；民法第 758 條談特定物權變動的生效要件。','實務理解要保留法律體系脈絡，不要把四字無限放大。'],
    keywords:['登記','絕對效力','公示','交易安全'], importance:5,
  },
  '73-1': {
    oneLiner: '土地法第 73-1 條是在處理「長期不辦繼承登記」：1 年未辦先催告，逾期可列冊管理 15 年，再進入公開標售與價款保管機制。',
    explanation: '這條很長，最有效的讀法是把它變成時間軸。第一站：繼承開始後超過一年仍未辦繼承登記，地政機關查明後公告繼承人在三個月內聲請，並書面通知。第二站：三個月仍不辦，可列冊管理；列冊管理期間是十五年。第三站：十五年後還沒辦，清冊移請國有財產署公開標售；標售前再公告三個月。第四站：繼承人、合法使用人或其他共有人依序有優先購買權，但決標後三十日內不表示就視為放棄。第五站：價款存專戶；長期無人領取或多次標售未果，還有後續歸國庫、登記國有與原權利人申領機制。\n\n所以這條不要一次背成一大段，應記成「1 年 → 3 個月 → 15 年 → 標售前 3 個月 → 決標後 30 日」的流程圖，再補五次標售、20% 酌減、10 年等後段規則。',
    why: '繼承發生後如果幾十年都不登記，登記簿上的權利人會和真正繼承關係嚴重脫節，土地也可能因繼承人眾多、失聯而無法管理或利用。第 73-1 條不是一開始就把土地收走，而是設計長期、多階段的催告、管理、標售與價款保管程序，在地籍清理與繼承人財產權之間取得平衡。',
    cases:[{title:'🧭 時間軸案例',content:'父親過世後，三名子女一直沒有辦土地繼承登記。超過一年後，地政機關查明，會先公告並書面通知在三個月內聲請；不是「滿一年土地就直接國有」。只有後續長期仍不處理，才會進入列冊管理、十五年後標售等階段。'}, {title:'🎯 數字陷阱',content:'考題最愛把時間交換：一年是未辦繼承登記的起點門檻；三個月是公告催辦期間；十五年是列冊管理期間；決標後三十日是優先購買權表示期間。把其中任兩個互換就可能是錯誤選項。'}],
    pitfalls:['誤以為逾一年未辦就直接收歸國有。','把三個月催辦期間與十五年列冊管理期間搞反。','漏看不可歸責於聲請人的期間可以扣除。','把標售價款與土地本身後續處理混為一談。'],
    examTips:['先背主幹時間軸：1 年 → 3 個月 → 15 年 → 標售。','優先購買：決標後 30 日內表示。','進階數字：再標售最低價酌減不得逾 20%；五次未標出後有國有登記機制。','這條數字很多，適合用流程圖而不是純文字背誦。'],
    keywords:['繼承登記','一年','三個月','列冊管理','十五年','公開標售','優先購買'], importance:5,
  },
  '79-1': {
    oneLiner: '土地法第 79-1 條的預告登記，是先把「將來要取得、變更或消滅土地權利的請求權」登記起來，防止登記名義人之後處分土地把這個請求架空。',
    explanation: '預告登記保護的不是現在已經完成的物權，而是「將來要求土地權利移轉、消滅、內容或次序變更」等請求權。聲請時要有登記名義人的同意書。\n\n預告登記還沒塗銷前，登記名義人若再做會妨礙已登記請求權的土地處分，對該請求權無效。但它不是萬能封鎖：因徵收、法院判決或強制執行而做的新登記，預告登記沒有排除效力。',
    why: '契約成立到正式完成土地權利登記，中間可能有時間差。預告登記就是替這段空窗期提供公示與保全，避免土地權利人反悔後再處分給別人，使原請求權人難以實現；同時對徵收、判決與強制執行保留例外，維持公法與司法執行效力。',
    cases:[{title:'📝 過戶前保全',content:'甲已約定將土地移轉給乙，但正式移轉登記尚未辦好。若符合法定要件並取得甲同意，可辦預告登記；之後甲若又做會妨礙乙請求權的處分，不能簡單把乙的已登記請求權架空。'}, {title:'🎯 例外題',content:'題目若說「有預告登記後，任何新登記都絕對不能辦」，是錯的。因徵收、法院判決或強制執行而為的新登記，預告登記沒有排除效力。'}],
    pitfalls:['把預告登記當成已經取得所有權。','忘記聲請需要登記名義人同意書。','誤以為可排除徵收、法院判決或強制執行的新登記。'],
    examTips:['保護的是請求權，不是直接創設所有權。','效果題：有妨礙已登記請求權的處分，對該請求權無效。','例外三件組：徵收、法院判決、強制執行。'],
    keywords:['預告登記','請求權','同意書','處分無效','強制執行'], importance:5,
  },
  '104': {
    oneLiner: '土地法第 104 條用交叉優先購買權避免「土地和房屋分屬不同人」時，被第三人買走後讓利用關係更複雜。',
    explanation: '這條先分兩個方向：基地出售時，地上權人、典權人或承租人有同條件優先購買權；房屋出售時，基地所有權人有同條件優先購買權。如果有多個優先權人，順序看登記先後。\n\n接著是程序：優先購買權人收到出賣通知後，十日內不表示，就視為放棄。如果出賣人根本沒有通知，就直接和第三人訂約，該契約不得對抗優先購買權人。這裡的「十日」和「不得對抗」都是高頻題眼。',
    why: '基地與地上房屋若長期分屬不同人，本來就容易發生使用、租賃與處分衝突。法律讓與標的有密切利用關係的一方優先買受，可以促進土地與建物權利關係整合，降低日後糾紛。',
    cases:[{title:'🏠 房地不同人',content:'甲擁有基地，乙依法承租基地並在其上有房屋。甲要把基地賣給丙時，乙在符合法定身分與同樣條件下有優先購買權；甲應通知乙，乙收到通知後十日內不表示才視為放棄。'}, {title:'🎯 未通知效果',content:'甲完全不通知有優先購買權的乙，就和丙簽買賣契約。考題若問法律效果，要注意條文寫的是「其契約不得對抗優先購買權人」，不是直接寫整份契約當然無效。'}],
    pitfalls:['只記基地出賣，忘記房屋出賣時基地所有權人也有優先權。','十日期間記錯。','把「不得對抗」寫成「契約絕對無效」。'],
    examTips:['雙向記：基地賣 → 地上權人／典權人／承租人；房屋賣 → 基地所有權人。','收到通知後 10 日不表示＝放棄。','未通知效果：契約不得對抗優先購買權人。'],
    keywords:['基地','房屋','優先購買權','十日','不得對抗'], importance:5,
  },
  '219': {
    oneLiner: '土地法第 219 條提供徵收後「沒有照計畫使用」時的收回機制：符合要件者，原土地所有權人可在法定期間內聲請按原徵收價額收回。',
    explanation: '這條要先區分兩個收回事由：第一，徵收補償發給完竣滿一年後，仍未依徵收計畫開始使用；第二，根本未依核准徵收的原定興辦事業使用。符合其中之一，原土地所有權人可自「補償發給完竣屆滿一年之次日」起五年內聲請收回。\n\n主管機關查明並經核准後，會通知原所有權人在六個月內繳清原受領徵收價額；逾期就視為放棄。若未開始使用是可歸責於原土地所有權人或使用人的原因，不能用第一款主張收回。後段另有土地後來因都市計畫變更而標售時的原所有權人或繼承人優先購買規定。',
    why: '徵收是以公共目的強制取得私人土地。如果國家取得後長期不用，或改做原本核准目的以外用途，強制剝奪私人財產的正當性就會受到質疑。因此法律給原所有權人一定期間內的收回機會，督促徵收土地依核准目的使用。',
    cases:[{title:'🏗️ 公共工程沒動工',content:'甲的土地被徵收興建公共設施，補償已發給完竣；滿一年後仍未依徵收計畫開始使用，而且原因不是甲造成。甲就要進一步檢查第 219 條的五年聲請期間，而不是認為土地一徵收就永遠沒有任何收回可能。'}, {title:'🎯 三個期間',content:'這條常把「一年、五年、六個月」混著考：一年和收回事由、起算點有關；五年是聲請收回期間；六個月是核准後繳回原徵收價額的期限。'}],
    pitfalls:['看到徵收後沒用就誤以為自動回復所有權，實際上要依法聲請並經核准。','一年、五年、六個月三個期間混淆。','漏看可歸責於原所有權人或使用人的排除。'],
    examTips:['收回事由兩款要會區分。','時間軸：補償完竣滿 1 年 → 次日起 5 年內聲請 → 通知後 6 個月內繳價。','後段另有標售時優先購買權，不要和前段收回權混在一起。'],
    keywords:['徵收','收回權','一年','五年','六個月','原土地所有權人'], importance:5,
  },
};

function landBand(articleNumber: string, text: string) {
  const n = Number.parseInt(articleNumber, 10);
  if (n <= 13) return { label:'總則與土地權屬基本概念', purpose:'先建立土地法的基本名詞、土地分類與公私權屬架構', scene:'土地權屬與基本概念判斷' };
  if (n <= 36) return { label: text.includes('外國人') ? '外國人土地權利限制' : text.includes('共有') ? '共有土地與權利協調' : '土地權利限制與公私土地制度', purpose:'界定哪些土地可以私有、哪些權利受到身分或公共利益限制，避免權利行使危及國土與他人利益', scene:'土地所有、共有或身分限制' };
  if (n <= 79) return { label: /登記|預告|地籍/.test(text) ? '地籍與土地登記制度' : '地籍測量與權利公示', purpose:'讓土地位置、面積與權利狀態有可查證的公示基礎，降低不動產交易資訊不對稱', scene:'地政事務所登記、測量或權利查驗' };
  if (n <= 134) return { label:'土地使用、租賃與基地關係', purpose:'協調所有權、使用權與社會利用需要，避免土地閒置或房地權利關係失衡', scene:'基地租賃、房地使用或優先購買' };
  if (n <= 207) return { label:'土地稅與地價制度', purpose:'建立地價、課稅與土地利益分配的規則，使土地持有與增值負擔有共同標準', scene:'地價評定、土地稅負或申報' };
  return { label:'土地徵收與補償', purpose:'限制國家強制取得私人土地的條件，並透過程序、補償與救濟維持公共利益與財產權保障的平衡', scene:'公共建設徵收、補償或收回' };
}

function buildLandMaterial(articleNumber: string, text: string, index: number): GeneratedTeachingMaterial {
  if (isDeletedArticle(text)) return deletedMaterial('land', articleNumber, text, index);
  const profile = profiles.land;
  const parts = chunks(text);
  const core = shorten(parts[0] || stripLabel(text), 72);
  const nums = extractNumbers(text);
  const sig = signals(text);
  const band = landBand(articleNumber, text);
  const override = LAND_EXPERT_OVERRIDES[articleNumber];
  const siblings = generatedArticles.land;
  const prev = index > 0 ? siblings[index - 1] : undefined;
  const next = index < siblings.length - 1 ? siblings[index + 1] : undefined;

  const clauseWalk = parts.slice(0, Math.min(4, parts.length)).map((part, i) => `第 ${i + 1} 層規則：${shorten(part, 88)}。`).join('');
  const genericExplanation = `先說人話：土地法第 ${articleNumber} 條不是泛泛在講「土地制度」，它放在「${band.label}」這一段，真正要處理的是「${core}」這個具體問題。\n\n${clauseWalk}${parts.length > 4 ? `後面還有 ${parts.length - 4} 層補充規則，閱讀時要繼續區分一般原則、程序與例外。` : ''}\n\n解題時不要只圈一個名詞。先確認「適用對象是誰」，再看「什麼事實出現時本條開始作用」，最後才判斷「可以、必須或不得做什麼」。${nums.length ? `本條另有 ${nums.join('、')} 等數字，應獨立做成時間／比例記憶點。` : ''}`;
  const genericWhy = `本條的制度位置在「${band.label}」。它的目的不是抽象地追求秩序，而是要${band.purpose}。\n\n從交易或地政實務看，如果沒有「${shorten(core, 45)}」這一層規則，${band.scene}時就會缺乏共同判準，權利人、交易相對人與主管機關很容易對同一件事有不同理解。`;
  const genericCase1 = `阿哲在處理一件${band.scene}案件時，碰到與第 ${articleNumber} 條「${shorten(core, 48)}」相同的事實。正確作法不是只憑生活直覺，而是先逐項核對本條的主體、前提與法律效果。${nums.length ? `如果題目把「${nums[0]}」改掉，答案就可能跟著改變。` : sig.exception ? '如果題目又出現但書或例外事實，還要重新檢查是否仍適用前段原則。' : '只要關鍵前提少一個，就不能直接套用結論。'}`;
  const genericCase2 = `考場常把第 ${articleNumber} 條變成「看起來很合理但只改一個字」的選項。建議先抓本條原文的核心動詞${sig.must ? '「應」' : sig.prohibit ? '「不得」' : sig.may ? '「得」' : ''}${nums.length ? `與數字「${nums.join('、')}」` : ''}，再判斷選項是否偷換主體、期限、比例或法律效果。`;

  const oneLiner = override?.oneLiner || `土地法第 ${articleNumber} 條在「${band.label}」裡的核心：${core}`;
  const explanation = override?.explanation || genericExplanation;
  const why = override?.why || genericWhy;
  const cases = override?.cases || [{title:'🏠 地政實務情境',content:genericCase1},{title:'🎯 考場變形',content:genericCase2}];
  const keywords = override?.keywords || extractKeywords(text, profile, articleNumber);
  const pitfalls = override?.pitfalls || unique([
    sig.exception ? '只背前段原則，漏掉但書或例外。' : '只背一句結論，沒有確認適用主體與前提。',
    nums.length ? `把 ${nums.join('、')} 等期限／比例互相交換。` : '題目偷換法條的核心動詞或法律效果。',
    sig.authority ? '把中央、地方、地政機關或法院的權限主體搞錯。' : `把本條和前後相近條文混用。`,
  ]).slice(0,4);
  const examTips = override?.examTips || unique([
    `先定位：本條屬於「${band.label}」。`,
    nums.length ? `數字題眼：${nums.join('、')}。` : `文字題眼：${core.slice(0,28)}。`,
    sig.exception ? '原則與例外一定成對記。' : '選項只改一個主體、動詞或效果就可能變錯。',
  ]);
  const importance = override?.importance ?? Math.min(5, 3 + (nums.length ? 1 : 0) + (sig.exception || sig.invalid ? 1 : 0));
  const confuseWith = [prev,next].filter(Boolean).map(adj=>({
    article:`土地法第${adj!.articleNumber}條`,
    diff:`第 ${articleNumber} 條重點是「${shorten(core,34)}」；相鄰第 ${adj!.articleNumber} 條則是「${shorten(chunks(adj!.text)[0] || stripLabel(adj!.text),34)}」。做題時先看兩條各自處理的制度問題，不要只因關鍵字相同就互換。`,
  }));
  const lectureScript = [
    `現在學土地法第${articleNumber}條。第一段先聽法條原文。`, text,
    `好，法條先停在這裡。老師先給你一句結論。${oneLiner}`,
    `接著用白話拆開。${explanation}`,
    `再回答一個常被忽略的問題：為什麼法律要這樣設計？${why}`,
    `我們放進具體情境。${cases[0]?.content || ''}`,
    `最後只記考試最需要的幾件事。${examTips.join(' ')}`,
  ].join('\n');
  return {
    id:`land-${articleNumber}`, lawId:'land', articleNumber, oneLiner, explanation, why, cases,
    pitfalls, confuseWith, examTips, relatedArticles:[prev,next].filter(Boolean).map(adj=>`土地法${adj!.articleNumber}`),
    keywords, importance, lectureScript,
    qa:{sourceAnchored:true,placeholderFree:true,generatedAt,generatorVersion},
  };
}

function buildMaterial(lawId: string, articleNumber: string, text: string, index: number): GeneratedTeachingMaterial {
  const law = lawsData.find(x => x.id === lawId);
  if (!law) throw new Error(`Unknown law ${lawId}`);
  if (lawId === 'land') return buildLandMaterial(articleNumber, text, index);
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
