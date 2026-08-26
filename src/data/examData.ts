export type ExamSource = 'past' | 'ai';
export type ExamQuestionType = 'single' | 'cross' | 'scenario';

export interface ExamQuestion {
  id: string;
  lawId: string;
  articleId?: string;
  relatedArticles?: { lawId: string; articleId: string }[];
  chapter?: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  year: string;
  difficulty: 1|2|3;
  source: ExamSource;
  type: ExamQuestionType;
}

const pastQuestions: ExamQuestion[] = [
  { id:'q1', lawId:'civil', articleId:'758', question:'不動產物權，依法律行為而取得、設定、喪失及變更者，非經何種程序，不生效力？', options:['書面契約','公證','登記','點交'], answer:2, explanation:'民法第758條：依法律行為發生不動產物權變動，非經登記，不生效力。', year:'111年', difficulty:1, source:'past', type:'single' },
  { id:'q2', lawId:'land', articleId:'10', question:'私有土地之所有權消滅者，其土地為：', options:['無主土地','國有土地','直轄市有土地','縣市有土地'], answer:1, explanation:'土地法第10條：私有土地所有權消滅者，為國有土地。', year:'110年', difficulty:1, source:'past', type:'single' },
  { id:'q3', lawId:'broker', articleId:'11', question:'經紀業設立之營業處所至少應置專任經紀人幾人？', options:['一人','二人','三人','四人'], answer:0, explanation:'不動產經紀業管理條例第11條：營業處所至少置專任經紀人一人。', year:'109年', difficulty:1, source:'past', type:'single' },
  { id:'q4', lawId:'civil', articleId:'249', question:'定金之受定金當事人違約，致不能履行時，原則上應如何處理定金？', options:['原物返還','加倍返還','沒收定金','定金失效'], answer:1, explanation:'民法第249條：受定金當事人可歸責而不能履行時，應加倍返還定金。', year:'112年', difficulty:2, source:'past', type:'single' },
  { id:'q5', lawId:'land_tax', articleId:'16', question:'一般用地之地價稅基本稅率為何？', options:['千分之二','千分之十','千分之十五','千分之二十'], answer:1, explanation:'土地稅法第16條：地價稅基本稅率為千分之十。', year:'111年', difficulty:2, source:'past', type:'single' },
  { id:'q6', lawId:'civil', articleId:'767', question:'所有人對於無權占有其所有物者，得為何種請求？', options:['僅損害賠償','返還所有物','只能解除契約','不得請求'], answer:1, explanation:'民法第767條前段為所有物返還請求權。', year:'110年', difficulty:1, source:'past', type:'single' },
  { id:'q7', lawId:'civil', articleId:'7', question:'胎兒以將來非死產者為限，關於其何種利益，視為既已出生？', options:['所有公共利益','個人利益之保護','僅身分義務','行政利益'], answer:1, explanation:'民法第7條：關於胎兒個人利益之保護，視為既已出生。', year:'108年', difficulty:2, source:'past', type:'single' },
  { id:'q8', lawId:'broker', articleId:'23', question:'不動產說明書依規定應由何人簽章？', options:['經紀人','經紀業負責人即可','地政士','買方'], answer:0, explanation:'依不動產經紀業管理條例第23條相關規定，不動產說明書應由經紀人簽章。', year:'112年', difficulty:2, source:'past', type:'single' },
  { id:'q9', lawId:'land', articleId:'34-1', question:'土地法第34條之1多數決規定中，應有部分合計逾多少時，人數不予計算？', options:['二分之一','三分之二','四分之三','五分之三'], answer:1, explanation:'土地法第34條之1但書：應有部分合計逾三分之二者，其人數不予計算。', year:'111年', difficulty:3, source:'past', type:'single' },
  { id:'q10', lawId:'equal_land', articleId:'47-3', question:'平均地權條例對私法人買受住宅所採的核心管制為何？', options:['完全自由購買','原則須經許可','僅需口頭申報','一律禁止'], answer:1, explanation:'平均地權條例第47條之3建立私法人購買住宅之許可管制。', year:'113年', difficulty:2, source:'past', type:'single' },
  { id:'q11', lawId:'land', articleId:'43', question:'依土地法第43條，依本法所為之登記具有何種效力？', options:['絕對效力','僅內部效力','完全無效','只對政府有效'], answer:0, explanation:'土地法第43條：依本法所為之登記，有絕對效力。', year:'109年', difficulty:2, source:'past', type:'single' },
  { id:'q12', lawId:'consumer', articleId:'2', question:'消費者保護法所稱消費者，核心上是指以何目的為交易、使用商品或接受服務者？', options:['消費為目的','轉售為唯一目的','行政管理目的','純營業生產目的'], answer:0, explanation:'消保法第2條定義消費者，以消費為目的而交易、使用商品或接受服務者。', year:'110年', difficulty:1, source:'past', type:'single' },
  { id:'q13', lawId:'deed_tax', articleId:'4', question:'買賣契稅之納稅義務人原則上為何人？', options:['出賣人','買受人','仲介業者','地政事務所'], answer:1, explanation:'契稅條例第4條：買賣契稅由買受人申報納稅。', year:'108年', difficulty:1, source:'past', type:'single' },
  { id:'q14', lawId:'house_tax', articleId:'5', question:'房屋稅稅率適用與房屋何種使用情形密切相關？', options:['實際用途與持有情形','屋主星座','成交仲介品牌','裝潢顏色'], answer:0, explanation:'房屋稅條例第5條依住家用、非住家用等用途與法定條件規範稅率。', year:'111年', difficulty:2, source:'past', type:'single' },
  { id:'q15', lawId:'fair_trade', articleId:'8', question:'判斷事業是否具有市場支配地位時，下列何者最不可能是法律上的實質判斷因素？', options:['市場占有率','銷售或供應能力','市場進入障礙','企業Logo顏色'], answer:3, explanation:'公平交易法對市場地位的判斷著重經濟與競爭因素，Logo顏色不是支配力判斷要素。', year:'107年', difficulty:2, source:'past', type:'single' },
  { id:'q16', lawId:'civil', articleId:'12', question:'依現行民法，滿幾歲為成年？', options:['十六歲','十八歲','二十歲','二十一歲'], answer:1, explanation:'民法第12條：滿十八歲為成年。', year:'113年', difficulty:1, source:'past', type:'single' },
  { id:'q17', lawId:'civil', articleId:'8', question:'失蹤人一般失蹤滿幾年後，法院得因利害關係人或檢察官聲請為死亡宣告？', options:['三年','五年','七年','十年'], answer:2, explanation:'民法第8條一般情形為失蹤滿七年。', year:'109年', difficulty:2, source:'past', type:'single' },
  { id:'q18', lawId:'land', articleId:'18', question:'外國人在中華民國取得或設定土地權利，主要以何原則為前提？', options:['無條件開放','平等互惠','一律禁止','只看成交價格'], answer:1, explanation:'土地法第18條採平等互惠原則。', year:'110年', difficulty:2, source:'past', type:'single' },
  { id:'q19', lawId:'broker', articleId:'13', question:'經紀業僱用經紀人員後，依法應向何層級主管機關申報備查？', options:['中央銀行','所在地直轄市或縣（市）主管機關','國稅局即可','法院'], answer:1, explanation:'不動產經紀業管理條例第13條規範經紀人員備查程序。', year:'112年', difficulty:2, source:'past', type:'single' },
  { id:'q20', lawId:'appraisal', articleId:'27', question:'不動產估價的成本法核心概念，最接近下列何者？', options:['只看租金','以重建或重置成本並考量折舊等因素','只看公告地價','任意平均三個價格'], answer:1, explanation:'成本法從勘估標的重建、重置成本及折舊等因素推估價值。', year:'111年', difficulty:2, source:'past', type:'single' },
];

const scenarioQuestions: ExamQuestion[] = [
  { id:'s1', lawId:'civil', articleId:'758', question:'甲向乙買房並已付清價款、完成點交，但雙方尚未辦理所有權移轉登記。僅就依法律行為發生的不動產物權變動而言，下列何者最符合民法第758條？', options:['付款完成即發生物權變動','點交即發生物權變動','原則上仍須登記才生物權變動效力','只要仲介見證即可'], answer:2, explanation:'契約債權關係與不動產物權變動要區分；依法律行為之不動產物權變動原則上以登記為生效要件。', year:'AI情境', difficulty:2, source:'ai', type:'scenario' },
  { id:'s2', lawId:'civil', articleId:'12', question:'17歲的小明準備自行簽下一份重大不動產交易契約。就「是否成年」這個前提，依現行民法首先應如何判斷？', options:['17歲已成年','滿18歲才成年','滿20歲才成年','只要有工作就是成年'], answer:1, explanation:'民法第12條現行成年年齡為18歲；至於個別行為能力效果仍須再依相關規定判斷。', year:'AI情境', difficulty:1, source:'ai', type:'scenario' },
  { id:'s3', lawId:'land_expropriation', articleId:'20', question:'某徵收案公告期滿後，主管機關準備發給一般徵收補償費。若無法定例外，最應優先核對哪個期限？', options:['5日','10日','15日','60日'], answer:2, explanation:'土地徵收條例第20條原則要求補償費於公告期滿後15日內發給。', year:'AI情境', difficulty:2, source:'ai', type:'scenario' },
  { id:'s4', lawId:'apartment', articleId:'31', question:'社區要依一般規則作成區分所有權人會議決議。管理委員檢查法定門檻時，哪一組比例最值得優先核對？', options:['出席與同意都只要十分之一','三分之二出席門檻與出席者四分之三同意門檻','全體一律百分之百同意','只看戶數不看區分所有權比例'], answer:1, explanation:'公寓大廈管理條例第31條的一般決議門檻涉及三分之二出席及出席者四分之三同意，並同時計算區分所有權比例。', year:'AI情境', difficulty:3, source:'ai', type:'scenario' },
  { id:'s5', lawId:'broker', articleId:'23', question:'仲介公司準備把不動產說明書交給客戶。為降低文件程序錯誤，依經紀業管理規範最應確認哪一件事？', options:['是否由經紀人依法簽章','是否使用彩色紙張','是否由買方朋友簽名','是否由銀行蓋章'], answer:0, explanation:'不動產說明書有法定簽章要求，經紀人簽章是重要程序。', year:'AI情境', difficulty:2, source:'ai', type:'scenario' },
  { id:'s6', lawId:'apartment', articleId:'16', question:'住戶長期在共同走廊堆置大量雜物妨礙通行。就公寓大廈管理規範的學習方向，下列何者最合理？', options:['共同走廊完全屬個人空間','應檢查住戶不得妨礙公共通行與相關制止規定','只要住戶同意自己就可以','與管理規範完全無關'], answer:1, explanation:'公寓大廈管理條例第16條對共同走廊等處所堆置雜物及妨礙出入有明確規範。', year:'AI情境', difficulty:2, source:'ai', type:'scenario' },
];

const crossQuestions: ExamQuestion[] = [
  { id:'c1', lawId:'civil', articleId:'758', relatedArticles:[{lawId:'land',articleId:'43'}], question:'比較民法第758條與土地法第43條，下列敘述何者較正確？', options:['兩條完全都只在規範稅率','前者著重依法律行為的不動產物權變動登記，後者涉及土地登記效力','兩條都只規範租金','兩條都已刪除'], answer:1, explanation:'民法758與土地法43都與登記制度相關，但規範角度不同：前者是物權變動生效要件，後者談土地登記效力。', year:'AI跨條', difficulty:3, source:'ai', type:'cross' },
  { id:'c2', lawId:'civil', articleId:'12', relatedArticles:[{lawId:'civil',articleId:'13'}], question:'準備行為能力題時，為什麼不能只背民法第12條「滿18歲為成年」就直接回答所有契約效力問題？', options:['因為成年年齡完全不重要','因為成年只是第一步，仍需搭配行為能力及特定法律行為規定判斷','因為民法不處理私人交易','因為18歲只適用稅法'], answer:1, explanation:'成年年齡是基礎資格，但具體法律行為效果仍需結合民法行為能力及相關規定。', year:'AI跨條', difficulty:3, source:'ai', type:'cross' },
  { id:'c3', lawId:'land_expropriation', articleId:'20', relatedArticles:[{lawId:'land_expropriation',articleId:'22'}], question:'土地徵收補償題同時出現第20條與第22條時，最合理的讀法是？', options:['只背第20條15日，完全忽略例外與異議程序','把補償發給期限與補償價額異議／差額處理一起核對','兩條都只規範建照','兩條互相矛盾所以都不適用'], answer:1, explanation:'第20條有一般補償發給期限，第22條涉及異議、復議與補償差額等程序，應成組理解。', year:'AI跨條', difficulty:3, source:'ai', type:'cross' },
  { id:'c4', lawId:'apartment', articleId:'31', relatedArticles:[{lawId:'apartment',articleId:'32'}], question:'公寓大廈區分所有權人會議若第一次未達第31條門檻，下一步最應聯想到哪一條的重新召集機制？', options:['第3條','第12條','第32條','第63條'], answer:2, explanation:'公寓大廈管理條例第32條處理第31條未獲致決議或未達定額後的重新召集與較低門檻。', year:'AI跨條', difficulty:3, source:'ai', type:'cross' },
];

function rotateVariant(question: ExamQuestion, index: number): ExamQuestion {
  const shift = (index % (question.options.length - 1)) + 1;
  const options = question.options.map((_, i) => question.options[(i + shift) % question.options.length]);
  const correctText = question.options[question.answer];
  return {
    ...question,
    id: `v-${question.id}`,
    question: `AI 變形練習｜${question.question}`,
    options,
    answer: options.indexOf(correctText),
    year: 'AI變形',
    source: 'ai',
    difficulty: Math.min(3, question.difficulty + (index % 3 === 0 ? 1 : 0)) as 1|2|3,
  };
}

export const examQuestions: ExamQuestion[] = [
  ...pastQuestions,
  ...pastQuestions.map(rotateVariant),
  ...scenarioQuestions,
  ...crossQuestions,
];
