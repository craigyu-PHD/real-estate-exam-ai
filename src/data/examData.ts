export interface ExamQuestion {
  id: string;
  lawId: string;
  chapter?: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  year: string;
  difficulty?: 1|2|3;
}

export const examQuestions: ExamQuestion[] = [
  { id: 'q1', lawId: 'civil', question: '不動產物權，依法律行為而取得、設定、喪失及變更者，非經何種程序，不生效力？', options: ['書面契約','公證','登記','點交'], answer: 2, explanation: '民法758 I：非經登記，不生效力。', year: '111年', difficulty: 1 },
  { id: 'q2', lawId: 'land', question: '私有土地之所有權消滅者，其土地為：', options: ['無主土地','國有土地','直轄市有土地','縣市有土地'], answer: 1, explanation: '土地法10 II：為國有土地。', year: '110年' },
  { id: 'q3', lawId: 'broker', question: '經紀業設立之營業處所至少應置專任經紀人幾人？', options: ['一人','二人','三人','四人'], answer: 0, explanation: '經紀業條例11 I：至少一人。', year: '109年' },
  { id: 'q4', lawId: 'civil', question: '定金之受定金當事人違約，致不能履行時，應如何？', options: ['原物返還','加倍返還','沒收定金','解除契約'], answer: 1, explanation: '民法249 III：加倍返還。', year: '112年' },
  { id: 'q5', lawId: 'land_tax', question: '一般用地之地價稅基本稅率為何？', options: ['千分之二','千分之十','千分之十五','千分之二十'], answer: 1, explanation: '土地稅法16：千分之十。', year: '111年' },
  { id: 'q6', lawId: 'civil', question: '所有人對於無權占有其所有物者，得為何種請求？', options: ['損害賠償','返還請求','不當得利','占有保護'], answer: 1, explanation: '民法767 I前段：返還請求權。', year: '110年' },
  { id: 'q7', lawId: 'civil', question: '胎兒以將來非死產者為限，視為既已出生，係保護何種利益？', options: ['身分利益','個人利益','財產利益','公益'], answer: 1, explanation: '民法7：個人利益。', year: '108年' },
  { id: 'q8', lawId: 'broker', question: '不動產說明書應由何人簽章？', options: ['經紀人','經紀業負責人','地政士','代銷'], answer: 0, explanation: '經紀業條例23：經紀人簽章。', year: '112年' },
  { id: 'q9', lawId: 'land', question: '土地法34-1處分共有土地，需共有人過半數及其應有部分合計過半數同意，但應有部分合計逾多少者人數不予計算？', options: ['二分之一','三分之二','四分之三','五分之三'], answer: 1, explanation: '土地法34-1 I但書：逾三分之二。', year: '111年' },
  { id: 'q10', lawId: 'equal_land', question: '平均地權條例規定，私法人買受住宅需經許可，俗稱？', options: ['豪宅條款','私法人購屋許可制','囤房稅','預售屋禁轉售'], answer: 1, explanation: '平均地權47-3：私法人購屋許可。', year: '113年' },
  { id: 'q11', lawId: 'land', question: '依土地法43條，依本法所為之登記，有何效力？', options: ['推定效力','絕對效力','相對效力','對抗效力'], answer: 1, explanation: '土地法43：絕對效力。', year: '109年' },
  { id: 'q12', lawId: 'consumer', question: '消費者保護法所稱消費者，指以何目的為交易者？', options: ['以消費為目的','以營業為目的','以投資為目的','以上皆是'], answer: 0, explanation: '消保法2：以消費為目的。', year: '110年' },
  { id: 'q13', lawId: 'deed_tax', question: '契稅之納稅義務人為何人？', options: ['出賣人','買受人','贈與人','受贈人'], answer: 1, explanation: '契稅條例4：買受人等取得權利人。', year: '108年' },
  { id: 'q14', lawId: 'house_tax', question: '房屋稅以什麼為課稅基礎？', options: ['公告現值','房屋現值','申報地價','交易價格'], answer: 1, explanation: '房屋稅條例5：房屋現值。', year: '111年' },
  { id: 'q15', lawId: 'fair_trade', question: '公平法所稱獨占，指事業在相關市場之占有率達一定程度，下列何者非考量因素？', options: ['市場占有率','總銷售金額','事業影響力','消費者偏好顏色'], answer: 3, explanation: '公平法8：前三者皆是。', year: '107年' },
  { id: 'q16', lawId: 'civil', question: '滿幾歲為成年？', options: ['十六歲','十八歲','二十歲','七歲'], answer: 1, explanation: '民法12：十八歲。', year: '113年' },
  { id: 'q17', lawId: 'civil', question: '失蹤人失蹤滿幾年得為死亡宣告（一般情形）？', options: ['三年','五年','七年','十年'], answer: 2, explanation: '民法8 I：七年。', year: '109年' },
  { id: 'q18', lawId: 'land', question: '外國人取得土地權利，以何原則為限？', options: ['最惠國','平等互惠','國民待遇','無條件'], answer: 1, explanation: '土地法18：平等互惠。', year: '110年' },
  { id: 'q19', lawId: 'broker', question: '經紀人員應完成備查之主管機關為何？', options: ['內政部','直轄市縣市主管機關','地政事務所','國稅局'], answer: 1, explanation: '經紀業條例13：直轄市縣市主管機關。', year: '112年' },
  { id: 'q20', lawId: 'appraisal', question: '不動產估價技術規則所稱成本法，其公式為何？', options: ['土地成本+建物成本','再調製成本-折舊','收益還原','比較價格'], answer: 1, explanation: '技術規則27：成本法。', year: '111年' },
];
