export interface LawChapter {
  id: string;
  name: string;
  startArticle: number;
  endArticle: number;
  articlesCount: number;
}

export interface LawRecord {
  id: string;
  name: string;
  category: string;
  description: string;
  chapters: LawChapter[];
  totalArticles: number;
}

export const lawsData: LawRecord[] = [
  {
    id: 'civil',
    name: '民法',
    category: '民法',
    description: '包含總則、債編、物權編、親屬編與繼承編（對應考試精選範圍）',
    totalArticles: 1439,
    chapters: [
      { id: 'c1', name: '第一編 總則', startArticle: 1, endArticle: 152, articlesCount: 152 },
      { id: 'c2', name: '第二編 債', startArticle: 153, endArticle: 756, articlesCount: 604 },
      { id: 'c3', name: '第三編 物權', startArticle: 757, endArticle: 966, articlesCount: 210 },
      { id: 'c4', name: '第四編 親屬', startArticle: 967, endArticle: 1137, articlesCount: 171 },
      { id: 'c5', name: '第五編 繼承', startArticle: 1138, endArticle: 1225, articlesCount: 88 },
    ]
  },
  {
    id: 'land',
    name: '土地法',
    category: '土地法與土地相關稅法',
    description: '土地法及施行法（已對齊 07_原始法規實際條文）',
    totalArticles: 262,
    chapters: [
      { id: 'l1', name: '第一編 總則', startArticle: 1, endArticle: 13, articlesCount: 13 },
      { id: 'l2', name: '第二編 地籍', startArticle: 14, endArticle: 79, articlesCount: 66 },
      { id: 'l3', name: '第三編 土地使用', startArticle: 80, endArticle: 134, articlesCount: 55 },
      { id: 'l4', name: '第四編 土地稅', startArticle: 135, endArticle: 207, articlesCount: 73 },
      { id: 'l5', name: '第五編 土地徵收', startArticle: 208, endArticle: 262, articlesCount: 55 },
    ]
  },
  {
    id: 'equal_land',
    name: '平均地權條例',
    category: '土地法與土地相關稅法',
    description: '平均地權條例',
    totalArticles: 113,
    chapters: [
      { id: 'el1', name: '平均地權條例 全文', startArticle: 1, endArticle: 113, articlesCount: 113 }
    ]
  },
  {
    id: 'land_tax',
    name: '土地稅法',
    category: '土地法與土地相關稅法',
    description: '地價稅、田賦、土地增值稅',
    totalArticles: 75,
    chapters: [
      { id: 'lt1', name: '土地稅法 全文', startArticle: 1, endArticle: 75, articlesCount: 75 }
    ]
  },
  {
    id: 'house_tax',
    name: '房屋稅條例',
    category: '土地法與土地相關稅法',
    description: '房屋稅條例',
    totalArticles: 26,
    chapters: [
      { id: 'ht1', name: '房屋稅條例 全文', startArticle: 1, endArticle: 26, articlesCount: 26 }
    ]
  },
  {
    id: 'deed_tax',
    name: '契稅條例',
    category: '土地法與土地相關稅法',
    description: '契稅條例',
    totalArticles: 35,
    chapters: [
      { id: 'dt1', name: '契稅條例 全文', startArticle: 1, endArticle: 35, articlesCount: 35 }
    ]
  },
  {
    id: 'broker',
    name: '不動產經紀業管理條例',
    category: '不動產經紀相關法規',
    description: '不動產經紀業管理條例',
    totalArticles: 43,
    chapters: [
      { id: 'b1', name: '經紀業管理條例 全文', startArticle: 1, endArticle: 43, articlesCount: 43 }
    ]
  },
  {
    id: 'consumer',
    name: '消費者保護法',
    category: '不動產經紀相關法規',
    description: '消費者保護法 (與不動產相關部分)',
    totalArticles: 78,
    chapters: [
      { id: 'cs1', name: '消保法 全文', startArticle: 1, endArticle: 78, articlesCount: 78 }
    ]
  },
  {
    id: 'fair_trade',
    name: '公平交易法',
    category: '不動產經紀相關法規',
    description: '公平交易法',
    totalArticles: 51,
    chapters: [
      { id: 'ft1', name: '公平交易法 全文', startArticle: 1, endArticle: 51, articlesCount: 51 }
    ]
  },
  {
    id: 'land_expropriation',
    name: '土地徵收條例',
    category: '土地法與土地相關稅法',
    description: '土地徵收程序、補償、區段徵收及撤銷廢止',
    totalArticles: 71,
    chapters: [
      { id: 'le1', name: '第一章 總則', startArticle: 1, endArticle: 9, articlesCount: 11 },
      { id: 'le2', name: '第二章 徵收程序', startArticle: 10, endArticle: 29, articlesCount: 22 },
      { id: 'le3', name: '第三章 徵收補償', startArticle: 30, endArticle: 36, articlesCount: 9 },
      { id: 'le4', name: '第四章 區段徵收', startArticle: 37, endArticle: 48, articlesCount: 13 },
      { id: 'le5', name: '第五章 徵收之撤銷及廢止', startArticle: 49, endArticle: 55, articlesCount: 8 },
      { id: 'le6', name: '第六章 附則', startArticle: 56, endArticle: 63, articlesCount: 8 },
    ]
  },
  {
    id: 'apartment',
    name: '公寓大廈管理條例',
    category: '不動產經紀相關法規',
    description: '公寓大廈住戶權利義務、管理組織、管理服務與罰則',
    totalArticles: 66,
    chapters: [
      { id: 'apt1', name: '第一章 總則', startArticle: 1, endArticle: 3, articlesCount: 3 },
      { id: 'apt2', name: '第二章 住戶之權利義務', startArticle: 4, endArticle: 24, articlesCount: 21 },
      { id: 'apt3', name: '第三章 管理組織', startArticle: 25, endArticle: 40, articlesCount: 17 },
      { id: 'apt4', name: '第四章 管理服務人', startArticle: 41, endArticle: 46, articlesCount: 6 },
      { id: 'apt5', name: '第五章 罰則', startArticle: 47, endArticle: 52, articlesCount: 7 },
      { id: 'apt6', name: '第六章 附則', startArticle: 53, endArticle: 63, articlesCount: 12 },
    ]
  },
  {
    id: 'appraisal',
    name: '不動產估價技術規則',
    category: '不動產估價概要',
    description: '不動產估價技術規則',
    totalArticles: 140,
    chapters: [
      { id: 'ap1', name: '第一章 總則', startArticle: 1, endArticle: 14, articlesCount: 14 },
      { id: 'ap2', name: '第二章 估價作業程序', startArticle: 15, endArticle: 26, articlesCount: 12 },
      { id: 'ap3', name: '第三章 估價方法', startArticle: 27, endArticle: 86, articlesCount: 60 },
      { id: 'ap4', name: '第四章 宗地估價', startArticle: 87, endArticle: 113, articlesCount: 27 },
      { id: 'ap5', name: '第五章 房地估價', startArticle: 114, endArticle: 140, articlesCount: 27 },
    ]
  }
];
