import 'server-only';
import type { ArticleDetailData } from './articleDetailTypes';
export const articleDetails: Record<string, ArticleDetailData> = {
  "civil-758": {
    id: "civil-758",
    lawId: "civil",
    articleNumber: "758",
    articleText: "不動產物權，依法律行為而取得、設定、喪失及變更者，非經登記，不生效力。\n前項行為，應以書面為之。",
    oneLiner: "房子就算付錢交屋，沒去地政事務所辦登記，在法律上就還不是你的。",
    explanation: "這一條是民法物權編的靈魂，叫「物權變動登記生效要件」。白話說：動產（手機、機車）交到你手上就算是你的；但不動產（土地、房屋）因為太貴、影響太大，國家強制規定：你們私下簽的買賣契約，只會產生『債』的效力——也就是『你有義務付錢、他有義務交屋』，但房子真正『換主人』的那一刻，是地政事務所把你的名字登到登記簿上的瞬間。沒登記，再多證據都贏不了有登記的人。",
    why: "為什麼要這樣？兩個理由：① 公示原則——讓第三人一看登記就知道房子是誰的，交易才安全；② 國家管理——地籍、稅賦、徵收都要以登記為準。若不經登記就生效，會出現『一屋二賣、誰才是屋主』的混亂。",
    cases: [
      { title: "案例A：一屋二賣", content: "小明把房子先賣給小華（簽約＋付頭期），但還沒登記；轉頭又賣給小強且馬上登記給小強。結果：小強是屋主，小華只能向小明請求違約賠償，因為物權沒登記不生效。" },
      { title: "案例B：只有契約沒登記", content: "阿芳付清房款、搬進去住了半年，但建商一直沒辦移轉登記。後來建商被債權人查封這間房。結果：房子仍登記在建商名下，查封有效，阿芳只能主張債權，不能主張物權返還。教訓：付錢≠取得物權。" }
    ],
    pitfalls: ["誤以為『簽約＝取得所有權』", "把『交付』當成不動產物權變動要件（交付只適用動產）", "忘記第二項『應以書面為之』，口頭約定不動產物權變動無效"],
    confuseWith: [
      { article: "民法第760條", diff: "760是『物權變動的債權行為』本身（如買賣契約）只需債權意思，758是『物權變動』需登記＋書面" },
      { article: "民法第759條", diff: "759處理『因登記錯誤被信賴』的善意第三人保護，與758的生效要件互補" }
    ],
    examTips: ["必背：『非經登記，不生效力』六字是選擇題題眼", "常考『書面』二字，有考題故意寫口頭約定讓你選錯", "與759、759-1善意取得搭配出題"],
    relatedArticles: ["民法759", "民法759-1", "土地法43"],
    keywords: ["物權變動", "登記生效", "公示原則", "書面"],
    importance: 5
  },
  "civil-767": {
    id: "civil-767",
    lawId: "civil",
    articleNumber: "767",
    articleText: "所有人對於無權占有或侵奪其所有物者，得請求返還之。對於妨害其所有權者，得請求除去之。對於有妨害其所有權之虞者，得請求防止之。\n前項規定，於所有權以外之物權，準用之。",
    oneLiner: "房子是你的，別人霸佔、擋住、或快要來亂，你都可以叫他走開。",
    explanation: "這條叫『物上請求權』，是所有權的防身術三招：① 返還請求權——有人無權占著你的房子（前房客租約到期不搬），你可請求還屋；② 除去妨害請求權——有人在你門口堆雜物、搭違建擋出入，你可請求拆除；③ 防止妨害請求權——鄰居正要蓋圍牆會擋你採光，你可先請求預防。這三招不問對方有無故意過失，只要『無權＋妨害』就成立。",
    why: "所有權若只能事後求償金錢，就不完整。物上請求權讓你能『回復圓滿支配狀態』，是不動產經紀處理占用、違建、鄰損糾紛的直接依據。",
    cases: [
      { title: "案例A：租約到期不搬", content: "房客租約到期仍占用，房東依767第1項前段請求返還房屋，無需證明房客故意，法院即判遷讓。" },
      { title: "案例B：頂樓加蓋擋逃生", content: "鄰居頂加侵占共用天台，管委會依767請求除去妨害，法院判拆除。即使鄰居說『我花錢蓋的』也不影響。" }
    ],
    pitfalls: ["與侵權行為損害賠償（184條）混淆：767不需過失、不以金錢為目的", "準用於地上權、抵押權等他物權，考試常挖洞問『僅所有權才能主張』是錯的"],
    examTips: ["三個請求權名稱必背，題目愛考『哪一個不能主張』", "第二項準用常考：地上權人也能用767"],
    relatedArticles: ["民法184", "民法962（占有保護）"],
    keywords: ["物上請求權", "返還", "除去妨害", "防止妨害"],
    importance: 5
  },
  "civil-1187": {
    id: "civil-1187",
    lawId: "civil",
    articleNumber: "1187",
    articleText: "遺囑人於不違反關於特留分規定之範圍內，得以遺囑自由處分遺產。",
    oneLiner: "想怎麼分遺產都可以，但不能踩到特留分的紅線。",
    explanation: "遺囑自由不是無限上綱。立遺囑人可自由指定誰拿多少，但法律為保護配偶、子女等繼承人，設了『特留分』最低保障（應繼分的二分之一或三分之一）。超過特留分的處分，繼承人可主張扣減。",
    why: "平衡『死者意願』與『家屬生存權』。避免老人被詐騙把全部財產留給外人，家人連基本保障都沒有。",
    cases: [
      { title: "案例", content: "父親遺囑把全部房產給小兒子，大女兒可依1223條主張特留分扣減，取回她特留分對應的比例。" }
    ],
    pitfalls: ["特留分不是遺囑無效，是『扣減』", "只有特留分權利人才能主張，檢察官不能主動介入"],
    examTips: ["搭配1223條特留分比例一起記"],
    relatedArticles: ["民法1223", "民法1225"],
    keywords: ["遺囑自由", "特留分", "扣減權"],
    importance: 4
  }
};

import { generatedArticles } from './generatedArticles';
import { generatedTeachingMaterials } from './generatedTeachingMaterials';

function lookupRealText(lawId: string, articleId: string): string | null {
  const list = generatedArticles[lawId];
  if (!list) return null;
  const found = list.find(a => a.articleNumber === articleId);
  return found ? found.text : null;
}

export function getArticleDetail(lawId: string, articleId: string): ArticleDetailData | undefined {
  const key = `${lawId}-${articleId}`;
  const realText = lookupRealText(lawId, articleId);
  const generated = generatedTeachingMaterials[key];
  const expert = articleDetails[key];
  if (!realText && !generated && !expert) return undefined;

  const base: ArticleDetailData = generated ? {
    ...generated,
    articleText: realText || '',
  } : expert!;

  if (!expert) return { ...base, articleText: realText || base.articleText };

  const merged: ArticleDetailData = {
    ...base,
    ...expert,
    articleText: realText || expert.articleText,
  };
  merged.lectureScript = [
    `現在學的是第${articleId}條。先聽一次法條原文。`,
    merged.articleText,
    `一句話先抓重點：${merged.oneLiner}`,
    `老師白話解析：${merged.explanation}`,
    `為什麼這樣規定：${merged.why}`,
    merged.cases[0] ? `實務案例：${merged.cases[0].title}。${merged.cases[0].content}` : '',
    `考試提醒：${merged.examTips.join(' ')}`,
  ].filter(Boolean).join('\n');
  return merged;
}
