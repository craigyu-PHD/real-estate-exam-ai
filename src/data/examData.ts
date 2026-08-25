export interface ExamQuestion {
  id: string;
  lawId: string;
  question: string;
  options: string[];
  answer: number; // index of options
  explanation: string;
  year: string;
}

export const examQuestions: ExamQuestion[] = [
  {
    id: 'q1',
    lawId: 'civil',
    question: '不動產物權，依法律行為而取得、設定、喪失及變更者，非經何種程序，不生效力？',
    options: ['書面契約', '公證', '登記', '點交'],
    answer: 2,
    explanation: '依民法第 758 條第 1 項規定：「不動產物權，依法律行為而取得、設定、喪失及變更者，非經登記，不生效力。」故選登記。',
    year: '111年'
  },
  {
    id: 'q2',
    lawId: 'land',
    question: '依土地法規定，私有土地之所有權消滅者，其土地為：',
    options: ['無主土地', '國有土地', '直轄市有土地', '縣市有土地'],
    answer: 1,
    explanation: '依土地法第 10 條第 2 項規定：「私有土地之所有權消滅者，為國有土地。」',
    year: '110年'
  },
  {
    id: 'q3',
    lawId: 'broker',
    question: '經紀業設立之營業處所至少應置專任經紀人幾人？',
    options: ['一人', '二人', '三人', '四人'],
    answer: 0,
    explanation: '依不動產經紀業管理條例第 11 條第 1 項規定：「經紀業設立之營業處所至少應置專任經紀人一人。但客運汽車及客運船舶得免設之。」',
    year: '109年'
  },
  {
    id: 'q4',
    lawId: 'civil',
    question: '定金法則中，若受定金當事人違約，應如何處理？',
    options: ['原物返還', '加倍返還', '沒收定金', '解除契約'],
    answer: 1,
    explanation: '依民法第 249 條第 3 款規定，契約因可歸責於受定金當事人之事由，致不能履行時，該當事人應加倍返還其所受之定金。',
    year: '112年'
  },
  {
    id: 'q5',
    lawId: 'land_tax',
    question: '一般用地之地價稅基本稅率為多少？',
    options: ['千分之二', '千分之十', '千分之十五', '千分之二十'],
    answer: 1,
    explanation: '依土地稅法第 16 條規定，地價稅基本稅率為千分之十（10‰）。',
    year: '111年'
  }
];
